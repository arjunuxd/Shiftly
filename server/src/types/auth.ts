export type Role = "job_seeker" | "vendor" | "admin" | "superadmin";

export const PUBLIC_ROLES: Role[] = ["job_seeker", "vendor"];

export function isPublicRole(value: unknown): value is "job_seeker" | "vendor" {
  return value === "job_seeker" || value === "vendor";
}

export function isAdminRole(value: unknown): value is "admin" | "superadmin" {
  return value === "admin" || value === "superadmin";
}

export interface AuthUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  role: Role | null;
}
