import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import { AppError } from "../middleware/errorHandler.js";
import type { VerificationDocStatus } from "../types/verification.js";

const VERIFICATIONS = "verifications";

interface VerificationDocument {
  userId: string;
  type: string;
  status: VerificationDocStatus;
  submittedAt: unknown;
  reviewedAt: unknown | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
}

export interface VerificationResponse {
  id: string;
  userId: string;
  type: string;
  status: VerificationDocStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
}

function toIso(v: unknown): string | null {
  if (v && typeof v === "object" && "toDate" in v) {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof v === "string") return v;
  return null;
}

function serialize(doc: FirebaseFirestore.DocumentSnapshot): VerificationResponse {
  const data = doc.data() as VerificationDocument;
  return {
    id: doc.id,
    userId: data.userId,
    type: data.type,
    status: data.status,
    submittedAt: toIso(data.submittedAt),
    reviewedAt: toIso(data.reviewedAt),
    rejectionReason: data.rejectionReason ?? null,
    reviewedBy: data.reviewedBy ?? null,
  };
}

export async function getPendingVerifications(): Promise<VerificationResponse[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(VERIFICATIONS)
    .where("status", "==", "pending")
    .orderBy("submittedAt", "desc")
    .get();

  return snapshot.docs.map(serialize);
}

export async function getAllVerifications(
  status?: string,
): Promise<VerificationResponse[]> {
  const db = getAdminFirestore();
  let query: FirebaseFirestore.Query = db.collection(VERIFICATIONS);

  if (status && status !== "all") {
    query = query.where("status", "==", status);
  }

  const snapshot = await query.orderBy("submittedAt", "desc").get();
  return snapshot.docs.map(serialize);
}

export async function approveJobSeekerVerification(
  userId: string,
  adminId: string,
): Promise<VerificationResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(VERIFICATIONS).doc(userId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new AppError(404, "Verification not found.");
  }

  const data = snapshot.data() as VerificationDocument;
  if (data.status !== "pending") {
    throw new AppError(400, `Cannot approve a verification with status "${data.status}".`);
  }

  const now = FieldValue.serverTimestamp();
  await ref.update({
    status: "approved" as VerificationDocStatus,
    reviewedAt: now,
    reviewedBy: adminId,
    rejectionReason: null,
  });

  const updated = await ref.get();
  return serialize(updated);
}

export async function rejectJobSeekerVerification(
  userId: string,
  adminId: string,
  reason: string,
): Promise<VerificationResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(VERIFICATIONS).doc(userId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new AppError(404, "Verification not found.");
  }

  const data = snapshot.data() as VerificationDocument;
  if (data.status !== "pending") {
    throw new AppError(400, `Cannot reject a verification with status "${data.status}".`);
  }

  const now = FieldValue.serverTimestamp();
  await ref.update({
    status: "rejected" as VerificationDocStatus,
    reviewedAt: now,
    reviewedBy: adminId,
    rejectionReason: reason,
  });

  const updated = await ref.get();
  return serialize(updated);
}
