import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import { AppError } from "../middleware/errorHandler.js";
import type {
  VerificationDocument,
  VerificationResponse,
  VerificationDocStatus,
} from "../types/verification.js";
import {
  getVerificationDocument,
  deleteVerificationDocument,
} from "./verificationDocumentService.js";

const VERIFICATIONS_COLLECTION = "verifications";

export async function getVerificationStatus(
  userId: string,
): Promise<VerificationResponse | null> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(VERIFICATIONS_COLLECTION)
    .doc(userId)
    .get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data() as VerificationDocument;

  return {
    id: snapshot.id,
    userId: data.userId,
    type: data.type,
    status: data.status,
    submittedAt:
      data.submittedAt && typeof data.submittedAt === "object" && "toDate" in data.submittedAt
        ? (data.submittedAt as { toDate: () => Date }).toDate().toISOString()
        : null,
    reviewedAt:
      data.reviewedAt && typeof data.reviewedAt === "object" && "toDate" in data.reviewedAt
        ? (data.reviewedAt as { toDate: () => Date }).toDate().toISOString()
        : null,
    rejectionReason: data.rejectionReason ?? null,
  };
}

export async function submitVerification(
  userId: string,
): Promise<VerificationResponse> {
  const document = await getVerificationDocument(userId);
  if (!document) {
    throw new AppError(
      400,
      "Please upload a valid identity document before submitting your verification.",
    );
  }

  const db = getAdminFirestore();
  const ref = db.collection(VERIFICATIONS_COLLECTION).doc(userId);

  const now = FieldValue.serverTimestamp();

  const doc: Omit<VerificationDocument, "reviewedAt"> & { reviewedAt: null } = {
    userId,
    type: "identity",
    status: "pending" as VerificationDocStatus,
    submittedAt: now,
    reviewedAt: null,
    rejectionReason: null,
    reviewedBy: null,
  };

  await ref.set(doc);

  return {
    id: userId,
    userId,
    type: "identity",
    status: "pending",
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    rejectionReason: null,
  };
}

export async function removeVerification(userId: string): Promise<void> {
  const existing = await getVerificationStatus(userId);
  if (!existing) {
    throw new AppError(400, "No verification found to remove.");
  }

  const db = getAdminFirestore();
  await db.collection(VERIFICATIONS_COLLECTION).doc(userId).delete();
  await deleteVerificationDocument(userId);
}
