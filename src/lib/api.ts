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
} from "../types";

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export interface AuthMeResponse {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  role: UserRole | null;
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
    throw new Error(`Failed to load user with status ${response.status}`);
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
    throw new Error(`Failed to assign role with status ${response.status}`);
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
    throw new Error(`Failed to load profile with status ${response.status}`);
  }

  return response.json() as Promise<Profile>;
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

  return response.json() as Promise<Profile>;
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

  return response.json() as Promise<Profile>;
}

export async function getVerification(
  idToken: string,
): Promise<VerificationRecord> {
  const response = await fetch(`${API_BASE_URL}/api/verification`, {
    headers: await authHeaders(idToken),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load verification with status ${response.status}`,
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

async function parseError(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null);
  return (body as { error?: string } | null)?.error ?? fallback;
}

export async function getVendorProfile(idToken: string): Promise<VendorProfile> {
  const response = await fetch(`${API_BASE_URL}/api/vendor`, {
    headers: await authHeaders(idToken),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("VENDOR_PROFILE_NOT_FOUND");
    }
    throw new Error(`Failed to load vendor profile with status ${response.status}`);
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
    throw new Error(`Failed to load vendor verification with status ${response.status}`);
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

export type JobPayload = Omit<
  Job,
  "id" | "vendorId" | "status" | "publishedAt" | "closedAt"
>;

export async function getMyJobs(idToken: string): Promise<Job[]> {
  const response = await fetch(`${API_BASE_URL}/api/jobs`, {
    headers: await authHeaders(idToken),
  });

  if (!response.ok) {
    throw new Error(`Failed to load jobs with status ${response.status}`);
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
  sortBy?: "newest" | "pay-high" | "pay-low";
  pageToken?: string;
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
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.pageToken) query.set("pageToken", params.pageToken);

  const qs = query.toString();
  const url = `${API_BASE_URL}/api/discover${qs ? `?${qs}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load jobs with status ${response.status}`);
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
    throw new Error(`Failed to load job with status ${response.status}`);
  }
  return response.json() as Promise<
    PublicJob & { myApplication?: { status: string } | null }
  >;
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
      `Failed to load applications with status ${response.status}`,
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
      `Failed to load application with status ${response.status}`,
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
