import type { AdminAction } from "./admin.js";

export interface AuditLogDocument {
  adminId: string;
  action: AdminAction;
  targetType: string;
  targetId: string;
  reason: string | null;
  createdAt: unknown;
}

export interface AuditLogResponse {
  id: string;
  adminId: string;
  action: AdminAction;
  targetType: string;
  targetId: string;
  reason: string | null;
  createdAt: string | null;
}
