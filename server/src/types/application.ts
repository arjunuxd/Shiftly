export type ApplicationStatus = "applied" | "withdrawn" | "accepted" | "rejected";

export interface ApplicationDocument {
  jobId: string;
  jobSeekerId: string;
  vendorId: string;
  status: ApplicationStatus;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface ApplicationResponse {
  id: string;
  jobId: string;
  jobTitle?: string;
  jobSeekerId: string;
  vendorId: string;
  status: ApplicationStatus;
  appliedAt: string | null;
  updatedAt: string | null;
}
