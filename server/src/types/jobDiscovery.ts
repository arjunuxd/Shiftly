export interface JobDiscoveryFilters {
  search?: string;
  jobCategory?: string;
  workType?: string;
  rateType?: string;
  minPay?: number;
  city?: string;
  sortBy?: "newest" | "pay-high" | "pay-low";
}

export interface JobDiscoveryPagination {
  limit: number;
  startAfterId?: string;
}

export interface JobDiscoveryMeta {
  totalEstimate: number;
  hasMore: boolean;
  nextPageToken: string | null;
}
