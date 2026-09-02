export type VerificationType = "identity";

export type VerificationDocStatus = "pending" | "approved" | "rejected";

export interface VerificationDocument {
  userId: string;
  type: VerificationType;
  status: VerificationDocStatus;
  submittedAt: unknown;
  reviewedAt: unknown | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
}

export interface VerificationResponse {
  id: string;
  userId: string;
  type: VerificationType;
  status: VerificationDocStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}
