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

function makeApplicationId(jobId: string, jobSeekerId: string): string {
  return `${jobId}_${jobSeekerId}`;
}

function serializeApplication(id: string, data: ApplicationDocument): ApplicationResponse {
  const toIso = (v: unknown): string | null =>
    v && typeof v === "object" && "toDate" in v
      ? (v as { toDate: () => Date }).toDate().toISOString()
      : null;

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

const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  applied: ["withdrawn", "accepted", "rejected"],
  withdrawn: [],
  accepted: [],
  rejected: [],
};

export async function createApplication(
  jobSeekerId: string,
  jobId: string,
): Promise<ApplicationResponse> {
  const db = getAdminFirestore();

  const job = await getJob(jobId);
  if (!job) {
    throw new AppError(404, "Job not found.");
  }
  if (job.status !== "published") {
    throw new AppError(400, "This job is no longer accepting applications.");
  }

  const applicationId = makeApplicationId(jobId, jobSeekerId);
  const ref = db.collection(COLLECTION).doc(applicationId);
  const existing = await ref.get();

  if (existing.exists) {
    const existingData = existing.data() as ApplicationDocument;
    if (existingData.status === "applied") {
      throw new AppError(409, "You have already applied to this job.");
    }
    if (existingData.status === "withdrawn") {
      await ref.update({
        status: "applied",
        updatedAt: FieldValue.serverTimestamp(),
      });
      const updated = await ref.get();
      return serializeApplication(
        updated.id,
        updated.data() as ApplicationDocument,
      );
    }
    throw new AppError(409, "You have already applied to this job.");
  }

  const now = FieldValue.serverTimestamp();
  const doc: ApplicationDocument = {
    jobId,
    jobSeekerId,
    vendorId: job.vendorId,
    status: "applied",
    createdAt: now,
    updatedAt: now,
  };

  await ref.set(doc);

  return {
    id: applicationId,
    jobId,
    jobSeekerId,
    vendorId: job.vendorId,
    status: "applied",
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getApplicationsForJobSeeker(
  jobSeekerId: string,
): Promise<ApplicationResponse[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where("jobSeekerId", "==", jobSeekerId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) =>
    serializeApplication(doc.id, doc.data() as ApplicationDocument),
  );
}

export async function getApplication(
  applicationId: string,
  jobSeekerId: string,
): Promise<ApplicationResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(applicationId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new AppError(404, "Application not found.");
  }

  const data = snapshot.data() as ApplicationDocument;
  if (data.jobSeekerId !== jobSeekerId) {
    throw new AppError(403, "You do not have access to this application.");
  }

  return serializeApplication(snapshot.id, data);
}

export async function getApplicationForJob(
  jobId: string,
  jobSeekerId: string,
): Promise<ApplicationResponse | null> {
  const db = getAdminFirestore();
  const applicationId = makeApplicationId(jobId, jobSeekerId);
  const snapshot = await db.collection(COLLECTION).doc(applicationId).get();

  if (!snapshot.exists) {
    return null;
  }

  return serializeApplication(
    snapshot.id,
    snapshot.data() as ApplicationDocument,
  );
}

export async function withdrawApplication(
  applicationId: string,
  jobSeekerId: string,
): Promise<ApplicationResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(applicationId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new AppError(404, "Application not found.");
  }

  const data = snapshot.data() as ApplicationDocument;
  if (data.jobSeekerId !== jobSeekerId) {
    throw new AppError(403, "You do not have access to this application.");
  }

  const allowed = VALID_TRANSITIONS[data.status];
  if (!allowed || !allowed.includes("withdrawn")) {
    throw new AppError(
      400,
      `Cannot withdraw an application with status "${data.status}".`,
    );
  }

  await ref.update({
    status: "withdrawn" as ApplicationStatus,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await ref.get();
  return serializeApplication(updated.id, updated.data() as ApplicationDocument);
}

export async function hasActiveApplication(
  jobId: string,
  jobSeekerId: string,
): Promise<boolean> {
  const app = await getApplicationForJob(jobId, jobSeekerId);
  return app !== null && app.status === "applied";
}
