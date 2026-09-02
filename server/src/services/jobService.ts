import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import type {
  JobDocument,
  JobResponse,
  JobStatus,
} from "../types/job.js";

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
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => serializeJob(doc.id, doc.data() as JobDocument));
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
  } = {
    vendorId,
    ...data,
    status: "draft" as JobStatus,
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
    throw new Error("Job not found");
  }

  const data = existing.data() as JobDocument;
  if (data.vendorId !== vendorId) {
    throw new Error("Not authorized to modify this job");
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
    throw new Error("Job not found");
  }

  const data = existing.data() as JobDocument;
  if (data.vendorId !== vendorId) {
    throw new Error("Not authorized to modify this job");
  }
  if (data.status !== "draft") {
    throw new Error("Only draft jobs can be published");
  }

  await ref.update({
    status: "published",
    publishedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await ref.get();
  return serializeJob(updated.id, updated.data() as JobDocument);
}

export async function closeJob(
  jobId: string,
  vendorId: string,
): Promise<JobResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(jobId);

  const existing = await ref.get();
  if (!existing.exists) {
    throw new Error("Job not found");
  }

  const data = existing.data() as JobDocument;
  if (data.vendorId !== vendorId) {
    throw new Error("Not authorized to modify this job");
  }
  if (data.status !== "published") {
    throw new Error("Only published jobs can be closed");
  }

  await ref.update({
    status: "closed",
    closedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await ref.get();
  return serializeJob(updated.id, updated.data() as JobDocument);
}
