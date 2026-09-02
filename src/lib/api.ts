import type {
  UserRole,
  Profile,
  VerificationRecord,
  VendorProfile,
  VendorVerificationInfo,
  Job,
  JobStatus,
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
