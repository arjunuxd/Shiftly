import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import { AppError } from "../middleware/errorHandler.js";
import type {
  ApplicationDocument,
  ApplicationResponse,
  ApplicationStatus,
} from "../types/application.js";
import { getJob } from "./jobService.js";

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
    .where("vendorId", "==", vendorId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    ...serializeApplication(doc.id, doc.data() as ApplicationDocument),
    jobTitle: job.title,
  }));
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
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new AppError(404, "Application not found.");
  }

  const data = snapshot.data() as ApplicationDocument;
  if (data.vendorId !== vendorId) {
    throw new AppError(403, "You do not have access to this application.");
  }
  if (data.status !== "applied") {
    throw new AppError(400, `Cannot accept an application with status "${data.status}".`);
  }

  const job = await getJob(data.jobId);
  if (!job) {
    throw new AppError(404, "Job not found.");
  }

  const batch = db.batch();

  batch.update(ref, {
    status: "accepted" as ApplicationStatus,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const newSpots = job.spotsAvailable - 1;
  const jobRef = db.collection("jobs").doc(data.jobId);
  batch.update(jobRef, {
    spotsAvailable: newSpots,
    updatedAt: FieldValue.serverTimestamp(),
    ...(newSpots <= 0
      ? { status: "closed", closedAt: FieldValue.serverTimestamp() }
      : {}),
  });

  await batch.commit();

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

  const updated = await ref.get();
  return serializeApplication(updated.id, updated.data() as ApplicationDocument);
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
