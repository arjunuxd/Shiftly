import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import { AppError } from "../middleware/errorHandler.js";
import type {
  JobDocument,
  JobResponse,
  JobStatus,
} from "../types/job.js";
import { MAX_IN_MEMORY_FETCH, sortDocsDesc } from "./queryInMemory.js";

const COLLECTION = "jobs";

function serializeJob(id: string, data: JobDocument): JobResponse {
  const toIso = (v: unknown): string | null =>
    v && typeof v === "object" && "toDate" in v
      ? (v as { toDate: () => Date }).toDate().toISOString()
      : null;

  return {
    id,
    vendorId: data.vendorId,
    title: data.title,
    description: data.description,
    jobCategory: data.jobCategory,
    workType: data.workType,
    rateType: data.rateType,
    rateAmount: data.rateAmount,
    requiredSkills: data.requiredSkills ?? undefined,
    location: data.location,
    startDate: data.startDate,
    endDate: data.endDate,
    shiftStart: data.shiftStart,
    shiftEnd: data.shiftEnd,
    spotsAvailable: data.spotsAvailable,
    status: data.status,
    publishedAt: toIso(data.publishedAt),
    closedAt: toIso(data.closedAt),
  };
}

export async function getJobsForVendor(vendorId: string): Promise<JobResponse[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where("vendorId", "==", vendorId)
    .limit(MAX_IN_MEMORY_FETCH)
    .get();

  const docs = sortDocsDesc(snapshot.docs, "createdAt");
  return docs.map((doc) => serializeJob(doc.id, doc.data() as JobDocument));
}

export async function getJob(id: string): Promise<JobResponse | null> {
  const db = getAdminFirestore();
  const snapshot = await db.collection(COLLECTION).doc(id).get();

  if (!snapshot.exists) {
    return null;
  }

  return serializeJob(snapshot.id, snapshot.data() as JobDocument);
}

export async function createJob(
  vendorId: string,
  data: Omit<JobDocument, "vendorId" | "createdAt" | "updatedAt" | "publishedAt" | "closedAt" | "status">,
): Promise<JobResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc();

  const now = FieldValue.serverTimestamp();

  const doc: Omit<JobDocument, "status" | "publishedAt" | "closedAt"> & {
    status: JobStatus;
    publishedAt: null;
    closedAt: null;
    moderationStatus: "normal";
  } = {
    vendorId,
    ...data,
    status: "draft" as JobStatus,
    moderationStatus: "normal",
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
    closedAt: null,
  };

  await ref.set(doc);

  const savedData = doc as unknown as JobDocument;
  return serializeJob(ref.id, savedData);
}

export async function updateJobFields(
  jobId: string,
  vendorId: string,
  updates: Partial<JobDocument>,
): Promise<JobResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(jobId);

  const existing = await ref.get();
  if (!existing.exists) {
    throw new AppError(404, "Job not found");
  }

  const data = existing.data() as JobDocument;
  if (data.vendorId !== vendorId) {
    throw new AppError(403, "Not authorized to modify this job");
  }

  const {
    vendorId: _v,
    status: _s,
    createdAt: _c,
    updatedAt: _u,
    publishedAt: _p,
    closedAt: _cl,
    ...safeUpdates
  } = updates as JobDocument & Record<string, unknown>;

  await ref.update({
    ...safeUpdates,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await ref.get();
  return serializeJob(updated.id, updated.data() as JobDocument);
}

export async function publishJob(
  jobId: string,
  vendorId: string,
): Promise<JobResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(jobId);

  const existing = await ref.get();
  if (!existing.exists) {
    throw new AppError(404, "Job not found");
  }

  const data = existing.data() as JobDocument;
  if (data.vendorId !== vendorId) {
    throw new AppError(403, "Not authorized to modify this job");
  }
  if (data.status !== "draft") {
    throw new AppError(400, "Only draft jobs can be published");
  }

  await ref.update({
    status: "published",
    publishedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await ref.get();
  const published = serializeJob(updated.id, updated.data() as JobDocument);

  // Notify job seekers whose saved preferences match this shift.
  try {
    const { notifyMatchingSeekersForJob } = await import("./jobAlertService.js");
    await notifyMatchingSeekersForJob(published);
  } catch {
    // Alert delivery must never block publishing.
  }

  return published;
}

export async function closeJob(
  jobId: string,
  vendorId: string,
): Promise<JobResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(jobId);

  const existing = await ref.get();
  if (!existing.exists) {
    throw new AppError(404, "Job not found");
  }

  const data = existing.data() as JobDocument;
  if (data.vendorId !== vendorId) {
    throw new AppError(403, "Not authorized to modify this job");
  }
  if (data.status !== "published") {
    throw new AppError(400, "Only published jobs can be closed");
  }

  await ref.update({
    status: "closed",
    closedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await ref.get();
  return serializeJob(updated.id, updated.data() as JobDocument);
}
