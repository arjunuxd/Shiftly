export type UserRole = "job_seeker" | "vendor" | "superadmin";

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

export interface Profile {
  id: string;
  personalInfo: ProfilePersonalInfo;
  skills: ProfileSkill[];
  experience: ProfileExperience[];
  education: ProfileEducation[];
  availability: ProfileAvailabilityDay[];
  workPreferences: ProfileWorkPreferences;
  location: ProfileLocation;
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
