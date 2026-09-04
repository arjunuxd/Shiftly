export type ReportStatus = "open" | "resolved" | "dismissed";
export type ReportTargetType = "user" | "job";

export interface ReportDocument {
  reporterId: string;
  targetType: ReportTargetType;
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
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description: string;
  status: ReportStatus;
  createdAt: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
}
