import { FieldValue } from "firebase-admin/firestore";
import type { DocumentSnapshot } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import { AppError } from "../middleware/errorHandler.js";
import type {
  SavedJobDocument,
  SavedJobItem,
} from "../types/savedJob.js";
import { getJob } from "./jobService.js";
import { MAX_IN_MEMORY_FETCH, sortDocsDesc } from "./queryInMemory.js";

const COLLECTION = "savedJobs";

function makeSavedId(jobSeekerId: string, jobId: string): string {
  return `${jobId}_${jobSeekerId}`;
}

function toIso(v: unknown): string | null {
  if (v && typeof v === "object" && "toDate" in v) {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

function serializeSaved(
  id: string,
  data: SavedJobDocument,
): SavedJobItem {
  return {
    id,
    jobId: data.jobId,
    savedAt: toIso(data.createdAt),
  };
}

export async function saveJob(
  jobSeekerId: string,
  jobId: string,
): Promise<SavedJobItem> {
  const db = getAdminFirestore();

  const job = await getJob(jobId);
  if (!job) {
    throw new AppError(404, "Job not found.");
  }

  const ref = db.collection(COLLECTION).doc(makeSavedId(jobSeekerId, jobId));
  const existing = await ref.get();
  if (existing.exists) {
    return serializeSaved(
      existing.id,
      existing.data() as SavedJobDocument,
    );
  }

  const now = FieldValue.serverTimestamp();
  const doc: SavedJobDocument = {
    jobSeekerId,
    jobId,
    createdAt: now,
  };

  await ref.set(doc);
  return {
    id: ref.id,
    jobId,
    savedAt: new Date().toISOString(),
  };
}

export async function unsaveJob(
  jobSeekerId: string,
  jobId: string,
): Promise<boolean> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(makeSavedId(jobSeekerId, jobId));
  const existing = await ref.get();
  if (!existing.exists) {
    throw new AppError(404, "Saved job not found.");
  }
  await ref.delete();
  return true;
}

export async function getSavedJobsForSeeker(
  jobSeekerId: string,
): Promise<SavedJobItem[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where("jobSeekerId", "==", jobSeekerId)
    .limit(MAX_IN_MEMORY_FETCH)
    .get();

  const docs = sortDocsDesc(snapshot.docs, "createdAt");
  const items = docs.map((doc) =>
    serializeSaved(doc.id, doc.data() as SavedJobDocument),
  );
  if (items.length === 0) {
    return items;
  }

  const jobIds = items.map((item) => item.jobId);
  const jobSnapshots = await db.getAll(
    ...jobIds.map((jobId) => db.collection("jobs").doc(jobId)),
    { fieldMask: ["title", "vendorId", "rateType", "rateAmount", "location", "status", "stopApplicationsAt"] },
  );
  const jobsById = new Map<string, DocumentSnapshot>();
  jobSnapshots.forEach((doc) => {
    if (doc.exists) jobsById.set(doc.id, doc);
  });

  const vendorIds = new Set<string>();
  for (const snap of jobSnapshots) {
    if (snap.exists) {
      const data = snap.data() as { vendorId?: string };
      if (data.vendorId) vendorIds.add(data.vendorId);
    }
  }
  const vendorSnapshots = await db.getAll(
    ...Array.from(vendorIds).map((uid) => db.collection("vendorProfiles").doc(uid)),
    { fieldMask: ["businessInfo"] },
  );
  const vendorNames = new Map<string, string>();
  vendorSnapshots.forEach((doc) => {
    if (!doc.exists) return;
    const data = doc.data() as { businessInfo?: { businessName?: string } };
    const name = data.businessInfo?.businessName;
    if (name) vendorNames.set(doc.id, name);
  });

  const now = Date.now();
  return items.flatMap((item) => {
    const snap = jobsById.get(item.jobId);
    if (!snap) {
      // Job was removed from the platform.
      return [];
    }
    const data = snap.data() as {
      title?: string;
      vendorId?: string;
      rateType?: string;
      rateAmount?: number;
      location?: { city?: string; state?: string };
      status?: string;
      stopApplicationsAt?: unknown;
    };
    let status: string | null = data.status ?? null;
    if (
      data.stopApplicationsAt &&
      typeof data.stopApplicationsAt === "object" &&
      "toMillis" in data.stopApplicationsAt
    ) {
      const stop = (data.stopApplicationsAt as { toMillis: () => number }).toMillis();
      if (stop < now) status = "closed";
    }
    return [
      {
        ...item,
        title: data.title ?? null,
        vendorName: data.vendorId ? (vendorNames.get(data.vendorId) ?? null) : null,
        rateType: data.rateType ?? null,
        rateAmount: typeof data.rateAmount === "number" ? data.rateAmount : null,
        city: data.location?.city ?? null,
        state: data.location?.state ?? null,
        status,
      },
    ];
  });
}

export async function isJobSaved(
  jobSeekerId: string,
  jobId: string,
): Promise<boolean> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(makeSavedId(jobSeekerId, jobId));
  const snapshot = await ref.get();
  return snapshot.exists;
}

export async function getSavedJobIdsForSeeker(
  jobSeekerId: string,
): Promise<string[]> {
  const items = await getSavedJobsForSeeker(jobSeekerId);
  return items.map((i) => i.jobId);
}