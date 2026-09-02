export type VendorVerificationStatus = "unverified" | "pending" | "approved" | "rejected";

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
  submittedAt: unknown | null;
  reviewedAt: unknown | null;
  rejectionReason: string | null;
}

export interface VendorProfileDocument {
  businessInfo: VendorBusinessInfo;
  location: VendorLocation;
  verification: VendorVerificationInfo;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface VendorProfileResponse
  extends Omit<VendorProfileDocument, "createdAt" | "updatedAt" | "verification"> {
  id: string;
  completeness: number;
  verification: {
    status: VendorVerificationStatus;
    submittedAt: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
  };
}
