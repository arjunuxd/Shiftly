import { FieldValue, Transaction } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import { AppError } from "../middleware/errorHandler.js";
import type {
  ApplicationDocument,
  ApplicationResponse,
  ApplicationStatus,
} from "../types/application.js";
import { getJob } from "./jobService.js";
import { createNotification } from "./notificationService.js";
import { calculateCompleteness } from "./profileService.js";
import type { JobDocument } from "../types/job.js";
import type { ProfileDocument } from "../types/profile.js";
import { MAX_IN_MEMORY_FETCH, sortDocsDesc } from "./queryInMemory.js";

const COLLECTION = "applications";

function toIso(v: unknown): string | null {
  if (v && typeof v === "object" && "toDate" in v) {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

function serializeApplication(id: string, data: ApplicationDocument): ApplicationResponse {
  return {
    id,
    jobId: data.jobId,
    jobSeekerId: data.jobSeekerId,
    vendorId: data.vendorId,
    status: data.status,
    appliedAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

export interface VendorApplicationWithJob extends ApplicationResponse {
  jobTitle: string;
  candidate?: VendorCandidateSummary | null;
}

export async function getApplicationsForVendorJob(
  jobId: string,
  vendorId: string,
): Promise<VendorApplicationWithJob[]> {
  const db = getAdminFirestore();

  const job = await getJob(jobId);
  if (!job) {
    throw new AppError(404, "Job not found.");
  }
  if (job.vendorId !== vendorId) {
    throw new AppError(403, "You do not have access to this job.");
  }

  const snapshot = await db
    .collection(COLLECTION)
    .where("jobId", "==", jobId)
    .limit(MAX_IN_MEMORY_FETCH)
    .get();

  const docs = sortDocsDesc(snapshot.docs, "createdAt");
  const applications = docs.map((doc) => ({
    ...serializeApplication(doc.id, doc.data() as ApplicationDocument),
    jobTitle: job.title,
  }));

  const candidateSummaries = await getCandidateSummaries(
    applications.map((a) => a.jobSeekerId),
  );

  return applications.map((app) => ({
    ...app,
    candidate: candidateSummaries.get(app.jobSeekerId) ?? null,
  }));
}

async function getCandidateSummaries(
  jobSeekerIds: string[],
): Promise<Map<string, VendorCandidateSummary>> {
  const db = getAdminFirestore();
  const map = new Map<string, VendorCandidateSummary>();
  const uniqueIds = Array.from(new Set(jobSeekerIds));
  const BATCH = 30;

  for (let i = 0; i < uniqueIds.length; i += BATCH) {
    const chunk = uniqueIds.slice(i, i + BATCH);
    const snapshot = await db
      .collection("profiles")
      .where("__name__", "in", chunk)
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data() as ProfileDocument;
      const summary: VendorCandidateSummary = {
        id: doc.id,
        fullName: data.personalInfo?.fullName ?? "",
        headline: data.headline ?? "",
        photoUrl: data.photoUrl ?? null,
        location: data.location,
        skills: data.skills ?? [],
        resumeUrl: data.resumeUrl ?? null,
        resumeName: data.resumeName ?? null,
        completeness: calculateCompleteness(data),
      };
      map.set(doc.id, summary);
    }
  }

  return map;
}

export interface VendorCandidateSummary {
  id: string;
  fullName: string;
  headline: string;
  photoUrl: string | null;
  location: ProfileDocument["location"];
  skills: ProfileDocument["skills"];
  resumeUrl: string | null;
  resumeName: string | null;
  completeness: number;
}

export async function getApplicationForVendor(
  applicationId: string,
  vendorId: string,
): Promise<VendorApplicationWithJob> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(applicationId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new AppError(404, "Application not found.");
  }

  const data = snapshot.data() as ApplicationDocument;
  if (data.vendorId !== vendorId) {
    throw new AppError(403, "You do not have access to this application.");
  }

  const job = await getJob(data.jobId);

  return {
    ...serializeApplication(snapshot.id, data),
    jobTitle: job?.title ?? "Unknown Job",
  };
}

export async function acceptApplication(
  applicationId: string,
  vendorId: string,
): Promise<ApplicationResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(applicationId);
  const jobRef = db.collection("jobs");

  const preSnapshot = await ref.get();
  const preData = preSnapshot.data() as ApplicationDocument | undefined;
  const recipientId = preData?.jobSeekerId;
  const jobId = preData?.jobId;

  let jobTitle = "this job";

  await db.runTransaction(async (transaction: Transaction): Promise<void> => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) {
      throw new AppError(404, "Application not found.");
    }

    const data = snapshot.data() as ApplicationDocument;
    if (data.vendorId !== vendorId) {
      throw new AppError(403, "You do not have access to this application.");
    }
    if (data.status !== "applied") {
      throw new AppError(
        400,
        `Cannot accept an application with status "${data.status}".`,
      );
    }

    const jobSnapshot = await transaction.get(jobRef.doc(data.jobId));
    if (!jobSnapshot.exists) {
      throw new AppError(404, "Job not found.");
    }

    const jobData = jobSnapshot.data() as JobDocument;
    if (typeof jobData.spotsAvailable !== "number" || jobData.spotsAvailable <= 0) {
      throw new AppError(400, "No spots are available for this job.");
    }

    jobTitle = jobData.title;

    transaction.update(ref, {
      status: "accepted" as ApplicationStatus,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const newSpots = jobData.spotsAvailable - 1;
    transaction.update(jobRef.doc(data.jobId), {
      spotsAvailable: newSpots,
      updatedAt: FieldValue.serverTimestamp(),
      ...(newSpots <= 0
        ? { status: "closed", closedAt: FieldValue.serverTimestamp() }
        : {}),
    });
  });

  await createNotification({
    recipientId: recipientId ?? "",
    type: "APPLICATION_ACCEPTED",
    title: "Application accepted",
    body: `Congratulations! The vendor hired you for "${jobTitle}".`,
    actorId: vendorId,
    data: { jobId: jobId ?? "", applicationId },
  });

  const updated = await ref.get();
  return serializeApplication(updated.id, updated.data() as ApplicationDocument);
}

export async function rejectApplication(
  applicationId: string,
  vendorId: string,
): Promise<ApplicationResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(applicationId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new AppError(404, "Application not found.");
  }

  const data = snapshot.data() as ApplicationDocument;
  if (data.vendorId !== vendorId) {
    throw new AppError(403, "You do not have access to this application.");
  }
  if (data.status !== "applied") {
    throw new AppError(400, `Cannot reject an application with status "${data.status}".`);
  }

  await ref.update({
    status: "rejected" as ApplicationStatus,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const job = await getJob(data.jobId);
  await createNotification({
    recipientId: data.jobSeekerId,
    type: "APPLICATION_REJECTED",
    title: "Application not selected",
    body: `Unfortunately your application for "${job?.title ?? "this job"}" was not selected.`,
    actorId: vendorId,
    data: { jobId: data.jobId, applicationId },
  });

  const updated = await ref.get();
  return serializeApplication(updated.id, updated.data() as ApplicationDocument);
}

function sanitizeCandidateProfile(
  profile: (ProfileDocument & { id: string }) | null,
): CandidateProfile | null {
  if (!profile?.personalInfo) {
    return null;
  }
  return {
    id: profile.id ?? "",
    fullName: profile.personalInfo.fullName ?? "",
    headline: profile.headline ?? "",
    bio: profile.personalInfo.bio ?? "",
    photoUrl: profile.photoUrl ?? null,
    location: profile.location,
    skills: profile.skills ?? [],
    experience: profile.experience ?? [],
    education: profile.education ?? [],
    certificates: profile.certificates ?? [],
    resumeUrl: profile.resumeUrl ?? null,
    resumeName: profile.resumeName ?? null,
    portfolioLinks: profile.portfolioLinks ?? [],
    completeness: calculateCompleteness(profile),
  };
}

export interface CandidateProfile {
  id: string;
  fullName: string;
  headline: string;
  bio: string;
  photoUrl: string | null;
  location: ProfileDocument["location"];
  skills: ProfileDocument["skills"];
  experience: ProfileDocument["experience"];
  education: ProfileDocument["education"];
  certificates: ProfileDocument["certificates"];
  resumeUrl: string | null;
  resumeName: string | null;
  portfolioLinks: ProfileDocument["portfolioLinks"];
  completeness: number;
}

export async function getCandidateProfileForVendor(
  applicationId: string,
  vendorId: string,
): Promise<CandidateProfile> {
  const db = getAdminFirestore();
  const appRef = db.collection(COLLECTION).doc(applicationId);
  const appSnapshot = await appRef.get();

  if (!appSnapshot.exists) {
    throw new AppError(404, "Application not found.");
  }

  const appData = appSnapshot.data() as ApplicationDocument;
  if (appData.vendorId !== vendorId) {
    throw new AppError(403, "You do not have access to this application.");
  }

  const profileSnapshot = await db
    .collection("profiles")
    .doc(appData.jobSeekerId)
    .get();

  const profile = profileSnapshot.exists
    ? ({ id: profileSnapshot.id, ...(profileSnapshot.data() as ProfileDocument) } as ProfileDocument & { id: string })
    : null;

  const candidate = sanitizeCandidateProfile(profile);
  if (!candidate) {
    throw new AppError(404, "This candidate has not completed their profile yet.");
  }

  return candidate;
}

export async function getVendorApplicantStats(
  vendorId: string,
): Promise<{ pending: number; accepted: number; rejected: number; total: number }> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where("vendorId", "==", vendorId)
    .get();

  let pending = 0;
  let accepted = 0;
  let rejected = 0;

  for (const doc of snapshot.docs) {
    const status = (doc.data() as ApplicationDocument).status;
    if (status === "applied") pending++;
    else if (status === "accepted") accepted++;
    else if (status === "rejected") rejected++;
  }

  return { pending, accepted, rejected, total: snapshot.size };
}
