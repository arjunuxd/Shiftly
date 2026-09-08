export interface JobAlertPreferences {
  userId: string;
  enabled: boolean;
  locationCity: string;
  locationState: string;
  jobCategories: string[];
  workTypes: string[];
  minRate: number | null;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface JobAlertPreferencesResponse {
  userId: string;
  enabled: boolean;
  locationCity: string;
  locationState: string;
  jobCategories: string[];
  workTypes: string[];
  minRate: number | null;
}