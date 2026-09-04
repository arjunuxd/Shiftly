import { type ValidationError } from "./profile.js";

export function validateMarkReadBody(body: unknown): ValidationError[] {
  if (body && typeof body === "object" && Object.keys(body).length > 0) {
    return [{ field: "body", message: "Request body should be empty." }];
  }
  return [];
}

export function validatePageToken(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return undefined;
  if (value.length > 128) return undefined;
  return value;
}

export function validateNotificationId(value: unknown): boolean {
  return (
    typeof value === "string" && value.length > 0 && value.length <= 128
  );
}
