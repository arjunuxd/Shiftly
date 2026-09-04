import type { ValidationError } from "./profile.js";

export function validateMessageBody(body: unknown): ValidationError[] {
  if (!body || typeof body !== "object") {
    return [{ field: "body", message: "Request body must be a JSON object." }];
  }

  const b = body as Record<string, unknown>;
  const errors: ValidationError[] = [];

  if (!b.text || typeof b.text !== "string") {
    errors.push({ field: "text", message: "text is required." });
  } else {
    const trimmed = b.text.trim();
    if (trimmed.length === 0) {
      errors.push({ field: "text", message: "text must not be empty." });
    } else if (trimmed.length > 2000) {
      errors.push({ field: "text", message: "text must be at most 2000 characters." });
    }
  }

  const forbidden = ["senderId", "createdAt"];
  for (const key of forbidden) {
    if (key in b) {
      errors.push({ field: key, message: `${key} cannot be set by the client.` });
    }
  }

  return errors;
}

export function validateConversationBody(body: unknown): ValidationError[] {
  if (!body || typeof body !== "object") {
    return [{ field: "body", message: "Request body must be a JSON object." }];
  }

  const b = body as Record<string, unknown>;
  const errors: ValidationError[] = [];

  if (!b.jobSeekerId || typeof b.jobSeekerId !== "string" || b.jobSeekerId.trim().length === 0) {
    errors.push({ field: "jobSeekerId", message: "jobSeekerId is required." });
  } else if (b.jobSeekerId.length > 128) {
    errors.push({ field: "jobSeekerId", message: "jobSeekerId is invalid." });
  }

  if (!b.applicationId || typeof b.applicationId !== "string" || b.applicationId.trim().length === 0) {
    errors.push({ field: "applicationId", message: "applicationId is required." });
  } else if (b.applicationId.length > 128) {
    errors.push({ field: "applicationId", message: "applicationId is invalid." });
  }

  if (!b.jobId || typeof b.jobId !== "string" || b.jobId.trim().length === 0) {
    errors.push({ field: "jobId", message: "jobId is required." });
  } else if (b.jobId.length > 128) {
    errors.push({ field: "jobId", message: "jobId is invalid." });
  }

  return errors;
}
