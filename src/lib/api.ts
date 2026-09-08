import type {
  UserRole,
  Profile,
  VerificationRecord,
  VendorProfile,
  VendorVerificationInfo,
  Job,
  JobStatus,
  Application,
  JobDiscoveryResponse,
  PublicJob,
  Conversation,
  Message,
  VendorApplicationWithJob,
  CandidateProfile,
  AdminUser,
  AdminPlatformOverview,
  AdminVerification,
  AdminVendorVerification,
  AdminJob,
  AdminReport,
  AdminAuditLog,
  NotificationListResponse,
  AppNotification,
  RecommendedJob,
  SavedJobsResponse,
  SavedJobItem,
  JobAlertPreferences,
  ReputationSummary,
} from "../types";
import { humanizeApiError } from "./errors";

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export interface AuthMeResponse {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  role: UserRole | null;
  accountStatus?: "active" | "suspended";
}

export async function getHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  return response.json() as Promise<{ status: string }>;
}

export async function getMe(idToken: string): Promise<AuthMeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      humanizeApiError(
        `Failed to load user with status ${response.status}`,
        "We couldn't load your account details. Please try again.",
      ),
    );
  }

  return response.json() as Promise<AuthMeResponse>;
}

export async function assignRole(
  idToken: string,
  role: UserRole,
): Promise<{ role: UserRole }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    throw new Error(
      humanizeApiError(
        `Failed to assign role with status ${response.status}`,
        "We couldn't set your account type. Please try again.",
      ),
    );
  }

  return response.json() as Promise<{ role: UserRole }>;
}

async function authHeaders(idToken: string): Promise<HeadersInit> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${idToken}`,
  };
}

export async function getProfile(idToken: string): Promise<Profile> {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    headers: await authHeaders(idToken),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("PROFILE_NOT_FOUND");
    }
    throw new Error(
      humanizeApiError(
        `Failed to load profile with status ${response.status}`,
        "We couldn't load your profile. Please try again.",
      ),
    );
  }

  return normalizeProfile(await response.json());
}

export async function createProfile(
  idToken: string,
  data: Omit<Profile, "id" | "completeness">,
): Promise<Profile> {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: "POST",
    headers: await authHeaders(idToken),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      (body as { error?: string } | null)?.error ??
      `Failed to create profile with status ${response.status}`;
    throw new Error(message);
  }

  return normalizeProfile(await response.json());
}

export async function updateProfile(
  idToken: string,
  data: Partial<Omit<Profile, "id" | "completeness">>,
): Promise<Profile> {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: "PATCH",
    headers: await authHeaders(idToken),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      (body as { error?: string } | null)?.error ??
      `Failed to update profile with status ${response.status}`;
    throw new Error(message);
  }

  return normalizeProfile(await response.json());
}

function normalizeProfile(raw: Partial<Profile> & { id: string }): Profile {
  return {
    headline: raw.headline ?? "",
    personalInfo: raw.personalInfo ?? { fullName: "", bio: "", phone: "" },
    skills: raw.skills ?? [],
    experience: raw.experience ?? [],
    education: raw.education ?? [],
    availability: raw.availability ?? [],
    workPreferences: raw.workPreferences ?? { jobCategories: [], workTypes: [] },
    location: raw.location ?? {
      city: "",
      state: "",
      country: "",
      latitude: null,
      longitude: null,
    },
    photoUrl: raw.photoUrl ?? null,
    resumeUrl: raw.resumeUrl ?? null,
    resumeName: raw.resumeName ?? null,
    certificates: raw.certificates ?? [],
    portfolioLinks: raw.portfolioLinks ?? [],
    completeness: raw.completeness ?? 0,
    id: raw.id,
  };
}

export async function getVerification(
  idToken: string,
): Promise<VerificationRecord> {
  const response = await fetch(`${API_BASE_URL}/api/verification`, {
    headers: await authHeaders(idToken),
  });

  if (!response.ok) {
    throw new Error(
      humanizeApiError(
        `Failed to load verification with status ${response.status}`,
        "We couldn't load your verification status.",
      ),
    );
  }

  return response.json() as Promise<VerificationRecord>;
}

export async function submitVerification(
  idToken: string,
): Promise<VerificationRecord> {
  const response = await fetch(`${API_BASE_URL}/api/verification`, {
    method: "POST",
    headers: await authHeaders(idToken),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      (body as { error?: string } | null)?.error ??
      `Failed to submit verification with status ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<VerificationRecord>;
}

export async function removeVerification(
  idToken: string,
): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/api/verification/remove`, {
    method: "POST",
    headers: await authHeaders(idToken),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "We couldn't remove your verification. Please try again."));
  }

  return response.json() as Promise<{ status: string }>;
}

async function parseError(response: Response, fallback: string): Promise<string> {
  if (response.status === 401) {
    return "Your session has expired. Please sign in again.";
  }
  if (response.status === 403) {
    return "You don't have permission to do that.";
  }
  if (response.status === 404) {
    return fallback;
  }
  if (response.status === 0) {
    return "You're offline. Check your connection and try again.";
  }
  if (response.status >= 500) {
    return "Something went wrong on our side. Please try again.";
  }
  const body = await response.json().catch(() => null);
  const raw = (body as { error?: string } | null)?.error;
  if (raw) {
    return humanizeApiError(raw, fallback);
  }
  return fallback;
}

export async function getVendorProfile(idToken: string): Promise<VendorProfile> {
  const response = await fetch(`${API_BASE_URL}/api/vendor`, {
    headers: await authHeaders(idToken),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("VENDOR_PROFILE_NOT_FOUND");
    }
    throw new Error(
      humanizeApiError(
        `Failed to load vendor profile with status ${response.status}`,
        "We couldn't load your business profile. Please try again.",
      ),
    );
  }

  return response.json() as Promise<VendorProfile>;
}

export async function createVendorProfile(
  idToken: string,
  data: Omit<VendorProfile, "id" | "completeness" | "verification">,
): Promise<VendorProfile> {
  const response = await fetch(`${API_BASE_URL}/api/vendor`, {
    method: "POST",
    headers: await authHeaders(idToken),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to create vendor profile with status ${response.status}`));
  }

  return response.json() as Promise<VendorProfile>;
}

export async function updateVendorProfile(
  idToken: string,
  data: Partial<Omit<VendorProfile, "id" | "completeness" | "verification">>,
): Promise<VendorProfile> {
  const response = await fetch(`${API_BASE_URL}/api/vendor`, {
    method: "PATCH",
    headers: await authHeaders(idToken),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to update vendor profile with status ${response.status}`));
  }

  return response.json() as Promise<VendorProfile>;
}

export async function getVendorVerification(
  idToken: string,
): Promise<VendorVerificationInfo> {
  const response = await fetch(`${API_BASE_URL}/api/vendor/verification`, {
    headers: await authHeaders(idToken),
  });

  if (!response.ok) {
    throw new Error(
      humanizeApiError(
        `Failed to load vendor verification with status ${response.status}`,
        "We couldn't load your verification status.",
      ),
    );
  }

  return response.json() as Promise<VendorVerificationInfo>;
}

export async function submitVendorVerification(
  idToken: string,
): Promise<VendorVerificationInfo> {
  const response = await fetch(`${API_BASE_URL}/api/vendor/verification`, {
    method: "POST",
    headers: await authHeaders(idToken),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to submit vendor verification with status ${response.status}`));
  }

  return response.json() as Promise<VendorVerificationInfo>;
}

export async function removeVendorVerification(
  idToken: string,
): Promise<VendorVerificationInfo> {
  const response = await fetch(`${API_BASE_URL}/api/vendor/verification/remove`, {
    method: "POST",
    headers: await authHeaders(idToken),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "We couldn't remove your verification. Please try again."));
  }

  return response.json() as Promise<VendorVerificationInfo>;
}

export type JobPayload = Omit<
  Job,
  "id" | "vendorId" | "status" | "publishedAt" | "closedAt"
>;

export async function getMyJobs(idToken: string): Promise<Job[]> {
  const response = await fetch(`${API_BASE_URL}/api/jobs`, {
    headers: await authHeaders(idToken),
  });

  if (!response.ok) {
    throw new Error(
      humanizeApiError(
        `Failed to load jobs with status ${response.status}`,
        "We couldn't load your jobs. Please try again.",
      ),
    );
  }

  return response.json() as Promise<Job[]>;
}

export async function getJob(
  idToken: string,
  jobId: string,
): Promise<Job> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
    headers: await authHeaders(idToken),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to load job with status ${response.status}`));
  }

  return response.json() as Promise<Job>;
}

export async function createJob(
  idToken: string,
  data: JobPayload,
): Promise<Job> {
  const response = await fetch(`${API_BASE_URL}/api/jobs`, {
    method: "POST",
    headers: await authHeaders(idToken),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to create job with status ${response.status}`));
  }

  return response.json() as Promise<Job>;
}

export async function updateJob(
  idToken: string,
  jobId: string,
  data: Partial<JobPayload>,
): Promise<Job> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
    method: "PATCH",
    headers: await authHeaders(idToken),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to update job with status ${response.status}`));
  }

  return response.json() as Promise<Job>;
}

export async function publishJob(
  idToken: string,
  jobId: string,
): Promise<Job> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/publish`, {
    method: "POST",
    headers: await authHeaders(idToken),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to publish job with status ${response.status}`));
  }

  return response.json() as Promise<Job>;
}

export async function closeJob(
  idToken: string,
  jobId: string,
): Promise<Job> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/close`, {
    method: "POST",
    headers: await authHeaders(idToken),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to close job with status ${response.status}`));
  }

  return response.json() as Promise<Job>;
}

export async function setJobStatus(
  idToken: string,
  jobId: string,
  status: JobStatus,
): Promise<Job> {
  if (status === "published") {
    return publishJob(idToken, jobId);
  }
  if (status === "closed") {
    return closeJob(idToken, jobId);
  }
  throw new Error("Invalid status action");
}

// ─── Job Discovery ─────────────────────────────────────────────

export interface JobDiscoveryParams {
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
  locationCity?: string;
  locationState?: string;
  pageToken?: string;
  lat?: number;
  lng?: number;
}

export async function discoverJobs(
  params: JobDiscoveryParams = {},
): Promise<JobDiscoveryResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.jobCategory) query.set("jobCategory", params.jobCategory);
  if (params.workType) query.set("workType", params.workType);
  if (params.rateType) query.set("rateType", params.rateType);
  if (params.minPay !== undefined) query.set("minPay", String(params.minPay));
  if (params.city) query.set("city", params.city);
  if (params.state) query.set("state", params.state);
  if (params.area) query.set("area", params.area);
  if (params.verifiedOnly) query.set("verifiedOnly", "true");
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.locationCity) query.set("locationCity", params.locationCity);
  if (params.locationState) query.set("locationState", params.locationState);
  if (params.pageToken) query.set("pageToken", params.pageToken);
  if (params.lat !== undefined) query.set("lat", String(params.lat));
  if (params.lng !== undefined) query.set("lng", String(params.lng));

  const qs = query.toString();
  const url = `${API_BASE_URL}/api/discover${qs ? `?${qs}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      humanizeApiError(
        `Failed to load jobs with status ${response.status}`,
        "We couldn't load available jobs. Please try again.",
      ),
    );
  }
  return response.json() as Promise<JobDiscoveryResponse>;
}

export async function discoverJob(
  jobId: string,
  idToken?: string,
): Promise<PublicJob & { myApplication?: { status: string } | null }> {
  const headers: HeadersInit = {};
  if (idToken) {
    headers.Authorization = `Bearer ${idToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/discover/${jobId}`, {
    headers,
  });
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("JOB_NOT_FOUND");
    }
    throw new Error(
      humanizeApiError(
        `Failed to load job with status ${response.status}`,
        "We couldn't load this job. Please try again.",
      ),
    );
  }
  return response.json() as Promise<
    PublicJob & { myApplication?: { status: string } | null }
  >;
}

// ─── Recommended Jobs (Phase 16) ──────────────────────────────

export async function getRecommendedJobs(
  idToken: string,
  limit = 6,
): Promise<RecommendedJob[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/discover/recommended?limit=${limit}`,
    { headers: { Authorization: `Bearer ${idToken}` } },
  );
  if (!response.ok) {
    throw new Error(
      humanizeApiError(
        `Failed to load recommendations with status ${response.status}`,
        "We couldn't load your recommendations right now.",
      ),
    );
  }
  const data = (await response.json()) as { jobs: RecommendedJob[] };
  return data.jobs ?? [];
}

// ─── Saved Jobs (Phase 16) ────────────────────────────────────

export async function getSavedJobs(idToken: string): Promise<SavedJobsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/saved-jobs`, {
    headers: await authHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, "We couldn't load your saved jobs."));
  }
  return response.json() as Promise<SavedJobsResponse>;
}

export async function isSavedJob(
  idToken: string,
  jobId: string,
): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/saved-jobs/${jobId}`, {
    headers: await authHeaders(idToken),
  });
  if (!response.ok) {
    return false;
  }
  const data = (await response.json()) as { saved: boolean };
  return data.saved;
}

export async function saveJob(
  idToken: string,
  jobId: string,
): Promise<SavedJobItem> {
  const response = await fetch(`${API_BASE_URL}/api/saved-jobs/${jobId}`, {
    method: "POST",
    headers: await authHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, "We couldn't save this job."));
  }
  return response.json() as Promise<SavedJobItem>;
}

export async function unsaveJob(
  idToken: string,
  jobId: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/saved-jobs/${jobId}`, {
    method: "DELETE",
    headers: await authHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, "We couldn't remove this saved job."));
  }
}

// ─── Job Alerts (Phase 16) ────────────────────────────────────

export async function getJobAlertPreferences(
  idToken: string,
): Promise<JobAlertPreferences | null> {
  const response = await fetch(`${API_BASE_URL}/api/job-alerts/preferences`, {
    headers: await authHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(
      humanizeApiError(
        `Failed to load job alerts with status ${response.status}`,
        "We couldn't load your job alert preferences.",
      ),
    );
  }
  const data = (await response.json()) as { preferences: JobAlertPreferences | null };
  return data.preferences;
}

export async function saveJobAlertPreferences(
  idToken: string,
  prefs: Partial<
    Omit<JobAlertPreferences, "userId" | "createdAt" | "updatedAt">
  >,
): Promise<JobAlertPreferences> {
  const response = await fetch(`${API_BASE_URL}/api/job-alerts/preferences`, {
    method: "PUT",
    headers: await authHeaders(idToken),
    body: JSON.stringify(prefs),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, "We couldn't save your job alert preferences."));
  }
  const data = (await response.json()) as { preferences: JobAlertPreferences };
  return data.preferences;
}

export async function deleteJobAlertPreferences(
  idToken: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/job-alerts/preferences`, {
    method: "DELETE",
    headers: await authHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, "We couldn't clear your job alert preferences."));
  }
}

// ─── Reputation & Reviews (Phase 16) ──────────────────────────

export async function getMyReputation(
  idToken: string,
): Promise<ReputationSummary> {
  const response = await fetch(`${API_BASE_URL}/api/reviews/reputation/me`, {
    headers: await authHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(
      humanizeApiError(
        `Failed to load reputation with status ${response.status}`,
        "We couldn't load your reputation right now.",
      ),
    );
  }
  const data = (await response.json()) as { reputation: ReputationSummary };
  return data.reputation;
}

export async function createReview(
  idToken: string,
  input: { applicationId: string; rating: number; comment?: string },
): Promise<{ id: string; rating: number; comment: string }> {
  const response = await fetch(`${API_BASE_URL}/api/reviews`, {
    method: "POST",
    headers: await authHeaders(idToken),
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, "We couldn't submit your review."));
  }
  return response.json() as Promise<{ id: string; rating: number; comment: string }>;
}

// ─── Applications ──────────────────────────────────────────────

export async function getMyApplications(
  idToken: string,
): Promise<Application[]> {
  const response = await fetch(`${API_BASE_URL}/api/applications`, {
    headers: await authHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(
      humanizeApiError(
        `Failed to load applications with status ${response.status}`,
        "We couldn't load your applications. Please try again.",
      ),
    );
  }
  return response.json() as Promise<Application[]>;
}

export async function getApplicationDetail(
  idToken: string,
  applicationId: string,
): Promise<Application> {
  const response = await fetch(
    `${API_BASE_URL}/api/applications/${applicationId}`,
    { headers: await authHeaders(idToken) },
  );
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("APPLICATION_NOT_FOUND");
    }
    throw new Error(
      humanizeApiError(
        `Failed to load application with status ${response.status}`,
        "We couldn't load this application. Please try again.",
      ),
    );
  }
  return response.json() as Promise<Application>;
}

export async function applyToJob(
  idToken: string,
  jobId: string,
): Promise<Application> {
  const response = await fetch(`${API_BASE_URL}/api/applications`, {
    method: "POST",
    headers: await authHeaders(idToken),
    body: JSON.stringify({ jobId }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to apply with status ${response.status}`));
  }
  return response.json() as Promise<Application>;
}

export async function withdrawApplication(
  idToken: string,
  applicationId: string,
): Promise<Application> {
  const response = await fetch(
    `${API_BASE_URL}/api/applications/${applicationId}/withdraw`,
    {
      method: "PATCH",
      headers: await authHeaders(idToken),
      body: JSON.stringify({}),
    },
  );
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to withdraw with status ${response.status}`));
  }
  return response.json() as Promise<Application>;
}

// ─── Vendor Applications ─────────────────────────────────────

export async function getVendorJobApplications(
  idToken: string,
  jobId: string,
): Promise<VendorApplicationWithJob[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/vendor/applications?jobId=${encodeURIComponent(jobId)}`,
    { headers: await authHeaders(idToken) },
  );
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to load applications with status ${response.status}`));
  }
  return response.json() as Promise<VendorApplicationWithJob[]>;
}

export async function getVendorApplication(
  idToken: string,
  applicationId: string,
): Promise<VendorApplicationWithJob> {
  const response = await fetch(
    `${API_BASE_URL}/api/vendor/applications/${encodeURIComponent(applicationId)}`,
    { headers: await authHeaders(idToken) },
  );
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to load application with status ${response.status}`));
  }
  return response.json() as Promise<VendorApplicationWithJob>;
}

export async function acceptApplication(
  idToken: string,
  applicationId: string,
): Promise<Application> {
  const response = await fetch(
    `${API_BASE_URL}/api/vendor/applications/${applicationId}/accept`,
    {
      method: "PATCH",
      headers: await authHeaders(idToken),
      body: JSON.stringify({}),
    },
  );
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to accept application with status ${response.status}`));
  }
  return response.json() as Promise<Application>;
}

export async function rejectApplication(
  idToken: string,
  applicationId: string,
): Promise<Application> {
  const response = await fetch(
    `${API_BASE_URL}/api/vendor/applications/${applicationId}/reject`,
    {
      method: "PATCH",
      headers: await authHeaders(idToken),
      body: JSON.stringify({}),
    },
  );
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to reject application with status ${response.status}`));
  }
  return response.json() as Promise<Application>;
}

export async function completeApplication(
  idToken: string,
  applicationId: string,
): Promise<Application> {
  const response = await fetch(
    `${API_BASE_URL}/api/vendor/applications/${applicationId}/complete`,
    {
      method: "PATCH",
      headers: await authHeaders(idToken),
      body: JSON.stringify({}),
    },
  );
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to mark application complete with status ${response.status}`));
  }
  return response.json() as Promise<Application>;
}

export async function getCandidateProfile(
  idToken: string,
  applicationId: string,
): Promise<CandidateProfile> {
  const response = await fetch(
    `${API_BASE_URL}/api/vendor/applications/${applicationId}/candidate`,
    { headers: await authHeaders(idToken) },
  );
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to load candidate profile with status ${response.status}`));
  }
  return response.json() as Promise<CandidateProfile>;
}

// ─── Conversations ───────────────────────────────────────────

export async function getConversations(
  idToken: string,
): Promise<Conversation[]> {
  const response = await fetch(`${API_BASE_URL}/api/conversations`, {
    headers: await authHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to load conversations with status ${response.status}`));
  }
  return response.json() as Promise<Conversation[]>;
}

export async function createConversation(
  idToken: string,
  data: { jobSeekerId: string; applicationId: string; jobId: string },
): Promise<Conversation> {
  const response = await fetch(`${API_BASE_URL}/api/conversations`, {
    method: "POST",
    headers: await authHeaders(idToken),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to create conversation with status ${response.status}`));
  }
  return response.json() as Promise<Conversation>;
}

export async function getConversationMessages(
  idToken: string,
  conversationId: string,
): Promise<Message[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/conversations/${conversationId}/messages`,
    { headers: await authHeaders(idToken) },
  );
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to load messages with status ${response.status}`));
  }
  return response.json() as Promise<Message[]>;
}

export async function sendConversationMessage(
  idToken: string,
  conversationId: string,
  text: string,
): Promise<Message> {
  const response = await fetch(
    `${API_BASE_URL}/api/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: await authHeaders(idToken),
      body: JSON.stringify({ text }),
    },
  );
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to send message with status ${response.status}`));
  }
  return response.json() as Promise<Message>;
}

// ─── Admin API ───────────────────────────────────────────────

async function adminHeaders(idToken: string): Promise<HeadersInit> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${idToken}`,
  };
}

export async function adminGetOverview(idToken: string): Promise<AdminPlatformOverview> {
  const response = await fetch(`${API_BASE_URL}/api/admin/overview`, {
    headers: await adminHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(`Failed to load overview with status ${response.status}`);
  }
  return response.json() as Promise<AdminPlatformOverview>;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
}

export async function adminGetUsers(
  idToken: string,
  params: {
    role?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {},
): Promise<AdminUsersResponse> {
  const query = new URLSearchParams();
  if (params.role) query.set("role", params.role);
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));
  const qs = query.toString();
  const response = await fetch(`${API_BASE_URL}/api/admin/users${qs ? `?${qs}` : ""}`, {
    headers: await adminHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(`Failed to load users with status ${response.status}`);
  }
  return response.json() as Promise<AdminUsersResponse>;
}

export async function adminCreateAdmin(
  idToken: string,
  params: { email: string; password: string; displayName?: string },
): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/api/admin/admins`, {
    method: "POST",
    headers: await adminHeaders(idToken),
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    throw new Error(
      humanizeApiError(
        await parseError(response, `Failed to create admin with status ${response.status}`),
        "We couldn't create that admin account. Please try again.",
      ),
    );
  }
  return response.json() as Promise<AdminUser>;
}

export async function adminGetUser(idToken: string, uid: string): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${uid}`, {
    headers: await adminHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(`Failed to load user with status ${response.status}`);
  }
  return response.json() as Promise<AdminUser>;
}

export async function adminSuspendUser(
  idToken: string,
  uid: string,
  reason: string,
): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${uid}/suspend`, {
    method: "POST",
    headers: await adminHeaders(idToken),
    body: JSON.stringify({ reason }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to suspend user with status ${response.status}`));
  }
  return response.json() as Promise<AdminUser>;
}

export async function adminRestoreUser(
  idToken: string,
  uid: string,
): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${uid}/restore`, {
    method: "POST",
    headers: await adminHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to restore user with status ${response.status}`));
  }
  return response.json() as Promise<AdminUser>;
}

export async function adminGetVerifications(
  idToken: string,
  status?: string,
): Promise<AdminVerification[]> {
  const qs = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
  const response = await fetch(`${API_BASE_URL}/api/admin/verifications${qs}`, {
    headers: await adminHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(`Failed to load verifications with status ${response.status}`);
  }
  return response.json() as Promise<AdminVerification[]>;
}

export async function adminApproveVerification(
  idToken: string,
  userId: string,
): Promise<AdminVerification> {
  const response = await fetch(`${API_BASE_URL}/api/admin/verifications/${userId}/approve`, {
    method: "POST",
    headers: await adminHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to approve verification with status ${response.status}`));
  }
  return response.json() as Promise<AdminVerification>;
}

export async function adminRejectVerification(
  idToken: string,
  userId: string,
  reason: string,
): Promise<AdminVerification> {
  const response = await fetch(`${API_BASE_URL}/api/admin/verifications/${userId}/reject`, {
    method: "POST",
    headers: await adminHeaders(idToken),
    body: JSON.stringify({ reason }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to reject verification with status ${response.status}`));
  }
  return response.json() as Promise<AdminVerification>;
}

export async function adminGetVendorVerifications(
  idToken: string,
  status?: string,
): Promise<AdminVendorVerification[]> {
  const qs = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
  const response = await fetch(`${API_BASE_URL}/api/admin/vendor-verifications${qs}`, {
    headers: await adminHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(`Failed to load vendor verifications with status ${response.status}`);
  }
  return response.json() as Promise<AdminVendorVerification[]>;
}

export async function adminApproveVendorVerification(
  idToken: string,
  uid: string,
): Promise<AdminVendorVerification> {
  const response = await fetch(`${API_BASE_URL}/api/admin/vendor-verifications/${uid}/approve`, {
    method: "POST",
    headers: await adminHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to approve vendor verification with status ${response.status}`));
  }
  return response.json() as Promise<AdminVendorVerification>;
}

export async function adminRejectVendorVerification(
  idToken: string,
  uid: string,
  reason: string,
): Promise<AdminVendorVerification> {
  const response = await fetch(`${API_BASE_URL}/api/admin/vendor-verifications/${uid}/reject`, {
    method: "POST",
    headers: await adminHeaders(idToken),
    body: JSON.stringify({ reason }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to reject vendor verification with status ${response.status}`));
  }
  return response.json() as Promise<AdminVendorVerification>;
}

export interface AdminJobsResponse {
  jobs: AdminJob[];
  total: number;
}

export async function adminGetJobs(
  idToken: string,
  params: {
    status?: string;
    moderationStatus?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {},
): Promise<AdminJobsResponse> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.moderationStatus) query.set("moderationStatus", params.moderationStatus);
  if (params.search) query.set("search", params.search);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));
  const qs = query.toString();
  const response = await fetch(`${API_BASE_URL}/api/admin/jobs${qs ? `?${qs}` : ""}`, {
    headers: await adminHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(`Failed to load jobs with status ${response.status}`);
  }
  return response.json() as Promise<AdminJobsResponse>;
}

export async function adminRemoveJob(
  idToken: string,
  jobId: string,
  reason: string,
): Promise<AdminJob> {
  const response = await fetch(`${API_BASE_URL}/api/admin/jobs/${jobId}/remove`, {
    method: "POST",
    headers: await adminHeaders(idToken),
    body: JSON.stringify({ reason }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to remove job with status ${response.status}`));
  }
  return response.json() as Promise<AdminJob>;
}

export async function adminRestoreJob(
  idToken: string,
  jobId: string,
): Promise<AdminJob> {
  const response = await fetch(`${API_BASE_URL}/api/admin/jobs/${jobId}/restore`, {
    method: "POST",
    headers: await adminHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to restore job with status ${response.status}`));
  }
  return response.json() as Promise<AdminJob>;
}

export interface AdminReportsResponse {
  reports: AdminReport[];
  total: number;
}

export async function adminGetReports(
  idToken: string,
  params: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {},
): Promise<AdminReportsResponse> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));
  const qs = query.toString();
  const response = await fetch(`${API_BASE_URL}/api/admin/reports${qs ? `?${qs}` : ""}`, {
    headers: await adminHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(`Failed to load reports with status ${response.status}`);
  }
  return response.json() as Promise<AdminReportsResponse>;
}

export async function adminResolveReport(
  idToken: string,
  reportId: string,
): Promise<AdminReport> {
  const response = await fetch(`${API_BASE_URL}/api/admin/reports/${reportId}/resolve`, {
    method: "POST",
    headers: await adminHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to resolve report with status ${response.status}`));
  }
  return response.json() as Promise<AdminReport>;
}

export async function adminDismissReport(
  idToken: string,
  reportId: string,
): Promise<AdminReport> {
  const response = await fetch(`${API_BASE_URL}/api/admin/reports/${reportId}/dismiss`, {
    method: "POST",
    headers: await adminHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, `Failed to dismiss report with status ${response.status}`));
  }
  return response.json() as Promise<AdminReport>;
}

export interface AdminAuditLogsResponse {
  logs: AdminAuditLog[];
  total: number;
}

export async function adminGetAuditLogs(
  idToken: string,
  params: { limit?: number; offset?: number } = {},
): Promise<AdminAuditLogsResponse> {
  const query = new URLSearchParams();
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));
  const qs = query.toString();
  const response = await fetch(`${API_BASE_URL}/api/admin/audit-logs${qs ? `?${qs}` : ""}`, {
    headers: await adminHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(`Failed to load audit logs with status ${response.status}`);
  }
  return response.json() as Promise<AdminAuditLogsResponse>;
}

// ─── Notifications (Phase 9) ──────────────────────────────────

export async function getNotifications(
  idToken: string,
  pageToken?: string,
): Promise<NotificationListResponse> {
  const query = pageToken ? `?pageToken=${encodeURIComponent(pageToken)}` : "";
  const response = await fetch(`${API_BASE_URL}/api/notifications${query}`, {
    headers: await authHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to load notifications with status ${response.status}`,
    );
  }
  return response.json() as Promise<NotificationListResponse>;
}

export async function getUnreadNotificationCount(
  idToken: string,
): Promise<number> {
  const response = await fetch(
    `${API_BASE_URL}/api/notifications/unread-count`,
    { headers: await authHeaders(idToken) },
  );
  if (!response.ok) {
    return 0;
  }
  const data = (await response.json()) as { unreadCount: number };
  return data.unreadCount;
}

export async function markNotificationAsRead(
  idToken: string,
  notificationId: string,
): Promise<AppNotification> {
  const response = await fetch(
    `${API_BASE_URL}/api/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: await authHeaders(idToken),
    },
  );
  if (!response.ok) {
    throw new Error(
      `Failed to mark notification as read with status ${response.status}`,
    );
  }
  const data = (await response.json()) as { notification: AppNotification };
  return data.notification;
}

export async function markAllNotificationsAsRead(
  idToken: string,
): Promise<{ updated: number }> {
  const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
    method: "PATCH",
    headers: await authHeaders(idToken),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to mark all notifications as read with status ${response.status}`,
    );
  }
  return response.json() as Promise<{ updated: number }>;
}
