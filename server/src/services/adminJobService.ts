import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import { AppError } from "../middleware/errorHandler.js";
import type { ModerationStatus } from "../types/admin.js";
import type { JobDocument, JobResponse } from "../types/job.js";

const COLLECTION = "jobs";

function toIso(v: unknown): string | null {
  if (v && typeof v === "object" && "toDate" in v) {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof v === "string") return v;
  return null;
}

function serializeJob(id: string, data: JobDocument & { moderationStatus?: ModerationStatus; moderatedAt?: unknown; moderatedBy?: string | null; moderationReason?: string | null }): JobResponse & {
  moderationStatus: ModerationStatus;
  moderatedAt: string | null;
  moderatedBy: string | null;
  moderationReason: string | null;
} {
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
    moderationStatus: data.moderationStatus ?? "normal",
    moderatedAt: toIso(data.moderatedAt ?? null),
    moderatedBy: data.moderatedBy ?? null,
    moderationReason: data.moderationReason ?? null,
  };
}

export type AdminJobResponse = ReturnType<typeof serializeJob>;

export async function getAdminJobs(params: {
  status?: string;
  moderationStatus?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ jobs: AdminJobResponse[]; total: number }> {
  const db = getAdminFirestore();
  const { status, moderationStatus, search, limit = 20, offset = 0 } = params;

  let query: FirebaseFirestore.Query = db.collection(COLLECTION);

  if (status && status !== "all") {
    query = query.where("status", "==", status);
  }
  if (moderationStatus && moderationStatus !== "all") {
    query = query.where("moderationStatus", "==", moderationStatus);
  }

  const snapshot = await query.orderBy("createdAt", "desc").get();

  let jobs = snapshot.docs.map((doc) =>
    serializeJob(doc.id, doc.data() as JobDocument & { moderationStatus?: ModerationStatus }),
  );

  if (search && search.trim().length > 0) {
    const lower = search.toLowerCase().trim();
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(lower) ||
        j.vendorId.toLowerCase().includes(lower) ||
        j.location.city.toLowerCase().includes(lower),
    );
  }

  const total = jobs.length;

  return {
    jobs: jobs.slice(offset, offset + limit),
    total,
  };
}

export async function getAdminJobById(
  jobId: string,
): Promise<AdminJobResponse> {
  const db = getAdminFirestore();
  const snapshot = await db.collection(COLLECTION).doc(jobId).get();

  if (!snapshot.exists) {
    throw new AppError(404, "Job not found.");
  }

  return serializeJob(snapshot.id, snapshot.data() as JobDocument & { moderationStatus?: ModerationStatus });
}

export async function removeJob(
  jobId: string,
  adminId: string,
  reason: string,
): Promise<AdminJobResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(jobId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new AppError(404, "Job not found.");
  }

  const data = snapshot.data() as JobDocument & { moderationStatus?: ModerationStatus };
  if (data.moderationStatus === "removed") {
    throw new AppError(400, "Job is already removed.");
  }

  const now = FieldValue.serverTimestamp();
  await ref.update({
    moderationStatus: "removed" as ModerationStatus,
    moderatedAt: now,
    moderatedBy: adminId,
    moderationReason: reason,
    updatedAt: now,
  });

  const updated = await ref.get();
  return serializeJob(updated.id, updated.data() as JobDocument & { moderationStatus?: ModerationStatus });
}

export async function restoreJob(
  jobId: string,
): Promise<AdminJobResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(jobId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new AppError(404, "Job not found.");
  }

  const data = snapshot.data() as JobDocument & { moderationStatus?: ModerationStatus };
  if (data.moderationStatus !== "removed") {
    throw new AppError(400, "Job is not removed.");
  }

  const now = FieldValue.serverTimestamp();
  await ref.update({
    moderationStatus: "normal" as ModerationStatus,
    moderatedAt: null,
    moderatedBy: null,
    moderationReason: null,
    updatedAt: now,
  });

  const updated = await ref.get();
  return serializeJob(updated.id, updated.data() as JobDocument & { moderationStatus?: ModerationStatus });
}
