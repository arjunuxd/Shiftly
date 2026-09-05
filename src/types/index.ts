export type UserRole = "job_seeker" | "vendor" | "admin" | "superadmin";

export const PUBLIC_ROLES: Exclude<UserRole, "superadmin">[] = [
  "job_seeker",
  "vendor",
];

export type VerificationStatus =
  | "unverified"
  | "pending"
  | "approved"
  | "rejected";

export type ApplicationStatus =
  | "applied"
  | "under-review"
  | "accepted"
  | "hired"
  | "completed"
  | "rejected"
  | "withdrawn"
  | "cancelled";

export type JobStatus = "draft" | "published" | "closed";

// Profile types (Phase 4)
export interface ProfilePersonalInfo {
  fullName: string;
  bio: string;
  phone: string;
}

export interface ProfileSkill {
  name: string;
  category: string;
}

export interface ProfileExperience {
  id: string;
  role: string;
  organization: string;
  description: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
}

export interface ProfileEducation {
  id: string;
  institution: string;
  qualification: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
  currentlyStudying?: boolean;
}

export interface ProfileAvailabilityDay {
  day: string;
  startTime: string;
  endTime: string;
}

export interface ProfileWorkPreferences {
  jobCategories: string[];
  workTypes: string[];
}

export interface ProfileLocation {
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

export interface ProfileCertificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialUrl: string;
}

export interface ProfilePortfolioLink {
  id: string;
  title: string;
  url: string;
  description: string;
}

export interface Profile {
  id: string;
  headline: string;
  personalInfo: ProfilePersonalInfo;
  skills: ProfileSkill[];
  experience: ProfileExperience[];
  education: ProfileEducation[];
  availability: ProfileAvailabilityDay[];
  workPreferences: ProfileWorkPreferences;
  location: ProfileLocation;
  photoUrl: string | null;
  resumeUrl: string | null;
  resumeName: string | null;
  certificates: ProfileCertificate[];
  portfolioLinks: ProfilePortfolioLink[];
  completeness: number;
}

export interface VerificationRecord {
  id?: string;
  userId: string;
  type: "identity";
  status: VerificationStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

export interface VerificationDocumentRecord {
  documentUrl: string;
  documentName: string;
  documentMime: string;
  documentSize: number;
  updatedAt: string | null;
}

export const JOB_CATEGORIES = [
  { value: "hospitality", label: "Hospitality" },
  { value: "retail", label: "Retail" },
  { value: "logistics", label: "Logistics" },
  { value: "events", label: "Events" },
  { value: "office", label: "Office" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "technology", label: "Technology" },
  { value: "creative", label: "Creative" },
  { value: "other", label: "Other" },
] as const;

export const WORK_TYPES = [
  { value: "part-time", label: "Part-time" },
  { value: "temporary", label: "Temporary" },
  { value: "freelance", label: "Freelance" },
  { value: "shift-based", label: "Shift-based" },
  { value: "event-work", label: "Event work" },
] as const;

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const SKILL_CATEGORIES = [
  "Hospitality",
  "Customer Service",
  "Retail",
  "Admin",
  "Technical",
  "Creative",
  "Physical",
  "Transport",
  "Other",
] as const;

// Vendor profile types (Phase 5)
export type VendorVerificationStatus =
  | "unverified"
  | "pending"
  | "approved"
  | "rejected";

export interface VendorBusinessInfo {
  businessName: string;
  businessType: string;
  description: string;
  website: string;
  phone: string;
  contactEmail: string;
}

export interface VendorLocation {
  city: string;
  state: string;
  country: string;
  address: string;
}

export interface VendorVerificationInfo {
  status: VendorVerificationStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

export interface VendorProfile {
  id: string;
  businessInfo: VendorBusinessInfo;
  location: VendorLocation;
  verification: VendorVerificationInfo;
  completeness: number;
}

// Job types (Phase 5)
export type JobRateType = "hourly" | "daily" | "fixed";

export interface JobLocation {
  city: string;
  state: string;
  country: string;
  address: string;
  area?: string;
}

export interface Job {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  jobCategory: string;
  workType: string;
  rateType: JobRateType;
  rateAmount: number;
  location: JobLocation;
  startDate: string;
  endDate: string;
  shiftStart: string;
  shiftEnd: string;
  spotsAvailable: number;
  status: JobStatus;
  publishedAt: string | null;
  closedAt: string | null;
}

export const BUSINESS_TYPES = [
  { value: "cafe-restaurant", label: "Café / Restaurant" },
  { value: "retail-store", label: "Retail Store" },
  { value: "warehouse-logistics", label: "Warehouse / Logistics" },
  { value: "event-agency", label: "Event Agency" },
  { value: "office-administration", label: "Office / Administration" },
  { value: "healthcare-facility", label: "Healthcare Facility" },
  { value: "education-facility", label: "Education Facility" },
  { value: "cleaning-services", label: "Cleaning Services" },
  { value: "hospitality-services", label: "Hospitality Services" },
  { value: "construction", label: "Construction" },
  { value: "technology", label: "Technology" },
  { value: "other", label: "Other" },
] as const;

export const RATE_TYPES = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "fixed", label: "Fixed" },
] as const;

// Application types (Phase 6)
export interface Application {
  id: string;
  jobId: string;
  jobTitle?: string;
  jobSeekerId: string;
  vendorId: string;
  status: ApplicationStatus;
  appliedAt: string | null;
  updatedAt: string | null;
}

// Public job (no vendorId exposed to seekers)
export interface PublicJob {
  id: string;
  title: string;
  description: string;
  jobCategory: string;
  workType: string;
  rateType: JobRateType;
  rateAmount: number;
  location: JobLocation;
  startDate: string;
  endDate: string;
  shiftStart: string;
  shiftEnd: string;
  spotsAvailable: number;
  status: JobStatus;
  publishedAt: string | null;
  vendorVerificationStatus: VendorVerificationStatus;
}

export interface JobDiscoveryMeta {
  totalEstimate: number;
  hasMore: boolean;
  nextPageToken: string | null;
}

export interface JobDiscoveryResponse {
  jobs: PublicJob[];
  meta: JobDiscoveryMeta;
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  "under-review": "Under Review",
  accepted: "Accepted",
  hired: "Hired",
  completed: "Completed",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  cancelled: "Cancelled",
};

// Conversation types (Phase 7)
export interface Conversation {
  id: string;
  participantVendorId: string;
  participantJobSeekerId: string;
  applicationId: string;
  jobId: string;
  lastMessageText: string;
  lastMessageAt: string | null;
  createdAt: string | null;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string | null;
}

export interface VendorApplicationWithJob extends Application {
  jobTitle: string;
  candidate?: VendorCandidateSummary;
}

export interface VendorCandidateSummary {
  id: string;
  fullName: string;
  headline: string;
  photoUrl: string | null;
  location: ProfileLocation;
  skills: ProfileSkill[];
  resumeUrl: string | null;
  resumeName: string | null;
  completeness: number;
}

export interface CandidateProfile {
  id: string;
  fullName: string;
  headline: string;
  bio: string;
  photoUrl: string | null;
  location: ProfileLocation;
  skills: ProfileSkill[];
  experience: ProfileExperience[];
  education: ProfileEducation[];
  certificates: ProfileCertificate[];
  resumeUrl: string | null;
  resumeName: string | null;
  portfolioLinks: ProfilePortfolioLink[];
  completeness: number;
}

// ─── Admin types (Phase 8) ──────────────────────────────────

export type AccountStatus = "active" | "suspended";
export type ModerationStatus = "normal" | "flagged" | "removed";
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
  | "REPORT_DISMISSED";

export interface AdminUser {
  uid: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  suspendedAt: string | null;
  suspensionReason: string | null;
  suspendedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminPlatformOverview {
  totalUsers: number;
  totalJobSeekers: number;
  totalVendors: number;
  totalSuperadmins: number;
  suspendedUsers: number;
  activeJobs: number;
  pendingVerifications: number;
  openReports: number;
}

export interface AdminVerification {
  id: string;
  userId: string;
  type: string;
  status: VerificationStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
}

export interface AdminVendorVerification {
  id: string;
  businessName: string;
  businessType: string;
  city: string;
  country: string;
  status: VendorVerificationStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

export interface AdminJob {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  jobCategory: string;
  workType: string;
  rateType: JobRateType;
  rateAmount: number;
  location: JobLocation;
  startDate: string;
  endDate: string;
  shiftStart: string;
  shiftEnd: string;
  spotsAvailable: number;
  status: JobStatus;
  publishedAt: string | null;
  closedAt: string | null;
  moderationStatus: ModerationStatus;
  moderatedAt: string | null;
  moderatedBy: string | null;
  moderationReason: string | null;
}

export type ReportStatusType = "open" | "resolved" | "dismissed";
export type ReportTargetType = "user" | "job";

export interface AdminReport {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description: string;
  status: ReportStatusType;
  createdAt: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: AdminAction;
  targetType: string;
  targetId: string;
  reason: string | null;
  createdAt: string | null;
}

// ─── Notification types (Phase 9) ─────────────────────────────
export type NotificationType =
  | "APPLICATION_RECEIVED"
  | "APPLICATION_WITHDRAWN"
  | "APPLICATION_ACCEPTED"
  | "APPLICATION_REJECTED"
  | "NEW_MESSAGE"
  | "VERIFICATION_APPROVED"
  | "VERIFICATION_REJECTED";

export interface AppNotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  readAt: string | null;
  createdAt: string | null;
  actorId: string | null;
  data: {
    jobId?: string | null;
    applicationId?: string | null;
    conversationId?: string | null;
    verificationType?: string | null;
    reason?: string | null;
  };
}

export interface NotificationListResponse {
  notifications: AppNotification[];
  unreadCount: number;
  nextPageToken: string | null;
  hasMore: boolean;
}
