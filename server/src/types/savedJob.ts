export interface SavedJobDocument {
  jobSeekerId: string;
  jobId: string;
  createdAt: unknown;
}

export interface SavedJobItem {
  id: string;
  jobId: string;
  savedAt: string | null;
  title?: string | null;
  vendorName?: string | null;
  rateType?: string | null;
  rateAmount?: number | null;
  city?: string | null;
  state?: string | null;
  status?: string | null;
}