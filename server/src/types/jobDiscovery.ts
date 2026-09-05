export interface JobDiscoveryFilters {
  search?: string;
  jobCategory?: string;
  workType?: string;
  rateType?: string;
  minPay?: number;
  city?: string;
  state?: string;
  area?: string;
  verifiedOnly?: boolean;
  sortBy?: "newest" | "pay-high" | "pay-low" | "location";
  locationHint?: { city?: string; state?: string };
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

export interface JobDiscoveryItem {
  id: string;
  title: string;
  description: string;
  jobCategory: string;
  workType: string;
  rateType: string;
  rateAmount: number;
  location: {
    city: string;
    state: string;
    country: string;
    address: string;
    area?: string;
  };
  startDate: string;
  endDate: string;
  shiftStart: string;
  shiftEnd: string;
  spotsAvailable: number;
  status: string;
  publishedAt: string | null;
  closedAt: string | null;
  vendorVerificationStatus: "unverified" | "pending" | "approved" | "rejected";
}
