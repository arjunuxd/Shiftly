import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import { AppError } from "../middleware/errorHandler.js";
import type { VendorProfileResponse } from "../types/vendorProfile.js";
import { getVendorProfile } from "./vendorProfileService.js";
import {
  getVerificationDocument,
  deleteVerificationDocument,
} from "./verificationDocumentService.js";

const COLLECTION = "vendorProfiles";

export interface VendorVerificationResult {
  status: VendorProfileResponse["verification"]["status"];
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

export async function submitVendorVerification(
  uid: string,
): Promise<VendorVerificationResult> {
  const existing = await getVendorProfile(uid);
  if (!existing) {
    throw new AppError(404, "Vendor profile not found. Create your profile first.");
  }
  if (existing.verification.status === "approved") {
    throw new AppError(409, "Vendor is already verified.");
  }
  if (existing.verification.status === "pending") {
    throw new AppError(409, "Verification is already pending review.");
  }

  const document = await getVerificationDocument(uid);
  if (!document) {
    throw new AppError(
      400,
      "Please upload a valid business document before submitting your verification.",
    );
  }

  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(uid);

  const now = FieldValue.serverTimestamp();

  await ref.update({
    "verification.status": "pending",
    "verification.submittedAt": now,
    "verification.reviewedAt": null,
    "verification.rejectionReason": null,
    updatedAt: now,
  });

  return {
    status: "pending",
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    rejectionReason: null,
  };
}

export async function removeVendorVerification(
  uid: string,
): Promise<VendorVerificationResult> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(uid);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new AppError(404, "Vendor profile not found.");
  }

  await ref.update({
    "verification.status": "unverified",
    "verification.submittedAt": null,
    "verification.reviewedAt": null,
    "verification.rejectionReason": null,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await deleteVerificationDocument(uid);

  return {
    status: "unverified",
    submittedAt: null,
    reviewedAt: null,
    rejectionReason: null,
  };
}
