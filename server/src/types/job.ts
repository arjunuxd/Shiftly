export type JobStatus = "draft" | "published" | "closed";

export type JobRateType = "hourly" | "daily" | "fixed";

export interface JobDocument {
  vendorId: string;
  title: string;
  description: string;
  jobCategory: string;
  workType: string;
  rateType: JobRateType;
  rateAmount: number;
  location: {
    city: string;
    state: string;
    country: string;
    address: string;
  };
  startDate: string;
  endDate: string;
  shiftStart: string;
  shiftEnd: string;
  spotsAvailable: number;
  status: JobStatus;
  createdAt: unknown;
  updatedAt: unknown;
  publishedAt: unknown | null;
  closedAt: unknown | null;
}

export interface JobResponse {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  jobCategory: string;
  workType: string;
  rateType: JobRateType;
  rateAmount: number;
  location: {
    city: string;
    state: string;
    country: string;
    address: string;
  };
  startDate: string;
  endDate: string;
  shiftStart: string;
  shiftEnd: string;
  spotsAvailable: number;
  status: JobStatus;
  publishedAt: string | null;
  closedAt: string | null;
}
