import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import type { AdminAction } from "../types/admin.js";
import type { AuditLogDocument, AuditLogResponse } from "../types/auditLog.js";

const COLLECTION = "adminAuditLogs";

function toIso(v: unknown): string | null {
  if (v && typeof v === "object" && "toDate" in v) {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof v === "string") return v;
  return null;
}

export async function logAdminAction(
  adminId: string,
  action: AdminAction,
  targetType: string,
  targetId: string,
  reason?: string,
): Promise<void> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc();

  const doc: AuditLogDocument = {
    adminId,
    action,
    targetType,
    targetId,
    reason: reason ?? null,
    createdAt: FieldValue.serverTimestamp(),
  };

  await ref.set(doc);
}

export async function getAuditLogs(params: {
  limit?: number;
  offset?: number;
}): Promise<{ logs: AuditLogResponse[]; total: number }> {
  const db = getAdminFirestore();
  const { limit = 50, offset = 0 } = params;

  const countSnap = await db.collection(COLLECTION).count().get();
  const total = countSnap.data().count;

  const snapshot = await db
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(offset + limit)
    .get();

  const logs: AuditLogResponse[] = snapshot.docs.map((doc) => {
    const data = doc.data() as AuditLogDocument;
    return {
      id: doc.id,
      adminId: data.adminId,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      reason: data.reason ?? null,
      createdAt: toIso(data.createdAt),
    };
  });

  return {
    logs: logs.slice(offset, offset + limit),
    total,
  };
}
