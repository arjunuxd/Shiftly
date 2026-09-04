import { type ValidationError } from "./profile.js";

export function validateApplicationBody(body: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== "object") {
    return [{ field: "body", message: "Request body must be a JSON object." }];
  }

  const b = body as Record<string, unknown>;

  if (!b.jobId || typeof b.jobId !== "string" || b.jobId.trim().length === 0) {
    errors.push({ field: "jobId", message: "jobId is required." });
  } else if (b.jobId.length > 128) {
    errors.push({ field: "jobId", message: "jobId is invalid." });
  }

  const forbidden = ["jobSeekerId", "vendorId", "status", "appliedAt", "updatedAt", "createdAt"];
  for (const key of forbidden) {
    if (key in b) {
      errors.push({ field: key, message: `${key} cannot be set by the client.` });
    }
  }

  return errors;
}

export function validateWithdrawBody(body: unknown): ValidationError[] {
  if (body && typeof body === "object" && Object.keys(body).length > 0) {
    return [{ field: "body", message: "Request body should be empty." }];
  }
  return [];
}

export function validateSearchParam(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length > 200) return null;
  return trimmed;
}

export function validateEnumParam(
  value: unknown,
  allowed: string[],
): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return null;
  if (!allowed.includes(value)) return null;
  return value;
}

export function validateMinPay(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return undefined;
  if (num > 100000) return undefined;
  return num;
}

export function validatePageToken(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return undefined;
  if (value.length > 128) return undefined;
  return value;
}
