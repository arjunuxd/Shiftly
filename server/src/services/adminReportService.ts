import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import { AppError } from "../middleware/errorHandler.js";
import type { ReportStatus } from "../types/report.js";

const COLLECTION = "reports";

interface ReportDocument {
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  description: string;
  status: ReportStatus;
  createdAt: unknown;
  resolvedAt: unknown | null;
  resolvedBy: string | null;
}

export interface ReportResponse {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  description: string;
  status: ReportStatus;
  createdAt: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

function toIso(v: unknown): string | null {
  if (v && typeof v === "object" && "toDate" in v) {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof v === "string") return v;
  return null;
}

function serializeReport(doc: FirebaseFirestore.DocumentSnapshot): ReportResponse {
  const data = doc.data() as ReportDocument;
  return {
    id: doc.id,
    reporterId: data.reporterId,
    targetType: data.targetType,
    targetId: data.targetId,
    reason: data.reason,
    description: data.description,
    status: data.status,
    createdAt: toIso(data.createdAt),
    resolvedAt: toIso(data.resolvedAt),
    resolvedBy: data.resolvedBy ?? null,
  };
}

export async function createReport(
  reporterId: string,
  targetType: string,
  targetId: string,
  reason: string,
  description: string,
): Promise<ReportResponse> {
  const db = getAdminFirestore();

  if (targetType !== "user" && targetType !== "job") {
    throw new AppError(400, "targetType must be 'user' or 'job'.");
  }

  if (reason.trim().length === 0) {
    throw new AppError(400, "reason is required.");
  }
  if (reason.length > 200) {
    throw new AppError(400, "reason must be at most 200 characters.");
  }
  if (description.length > 2000) {
    throw new AppError(400, "description must be at most 2000 characters.");
  }

  const ref = db.collection(COLLECTION).doc();
  const now = FieldValue.serverTimestamp();

  await ref.set({
    reporterId,
    targetType,
    targetId,
    reason: reason.trim(),
    description: description.trim(),
    status: "open" as ReportStatus,
    createdAt: now,
    resolvedAt: null,
    resolvedBy: null,
  });

  return {
    id: ref.id,
    reporterId,
    targetType,
    targetId,
    reason: reason.trim(),
    description: description.trim(),
    status: "open",
    createdAt: null,
    resolvedAt: null,
    resolvedBy: null,
  };
}

export async function getReports(params: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ reports: ReportResponse[]; total: number }> {
  const db = getAdminFirestore();
  const { status, limit = 20, offset = 0 } = params;

  let query: FirebaseFirestore.Query = db.collection(COLLECTION);

  if (status && status !== "all") {
    query = query.where("status", "==", status);
  }

  const countSnap = await query.count().get();
  const total = countSnap.data().count;

  const snapshot = await query
    .orderBy("createdAt", "desc")
    .limit(offset + limit)
    .get();

  const reports = snapshot.docs.map(serializeReport);

  return {
    reports: reports.slice(offset, offset + limit),
    total,
  };
}

export async function getReportById(reportId: string): Promise<ReportResponse> {
  const db = getAdminFirestore();
  const snapshot = await db.collection(COLLECTION).doc(reportId).get();

  if (!snapshot.exists) {
    throw new AppError(404, "Report not found.");
  }

  return serializeReport(snapshot);
}

export async function resolveReport(
  reportId: string,
  adminId: string,
): Promise<ReportResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(reportId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new AppError(404, "Report not found.");
  }

  const data = snapshot.data() as ReportDocument;
  if (data.status !== "open") {
    throw new AppError(400, `Cannot resolve a report with status "${data.status}".`);
  }

  const now = FieldValue.serverTimestamp();
  await ref.update({
    status: "resolved" as ReportStatus,
    resolvedAt: now,
    resolvedBy: adminId,
  });

  const updated = await ref.get();
  return serializeReport(updated);
}

export async function dismissReport(
  reportId: string,
  adminId: string,
): Promise<ReportResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(reportId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new AppError(404, "Report not found.");
  }

  const data = snapshot.data() as ReportDocument;
  if (data.status !== "open") {
    throw new AppError(400, `Cannot dismiss a report with status "${data.status}".`);
  }

  const now = FieldValue.serverTimestamp();
  await ref.update({
    status: "dismissed" as ReportStatus,
    resolvedAt: now,
    resolvedBy: adminId,
  });

  const updated = await ref.get();
  return serializeReport(updated);
}
