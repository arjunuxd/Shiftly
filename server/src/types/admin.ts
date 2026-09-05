export type AccountStatus = "active" | "suspended";

export type ModerationStatus = "normal" | "flagged" | "removed";

export type ReportTargetType = "user" | "job";

export type ReportStatus = "open" | "resolved" | "dismissed";

export type AdminAction =
  | "USER_SUSPENDED"
  | "USER_RESTORED"
  | "VENDOR_VERIFIED"
  | "VENDOR_REJECTED"
  | "JOB_SEEKER_VERIFIED"
  | "JOB_SEEKER_REJECTED"
  | "JOB_REMOVED"
  | "JOB_RESTORED"
  | "REPORT_RESOLVED"
  | "REPORT_DISMISSED"
  | "ADMIN_CREATED";
