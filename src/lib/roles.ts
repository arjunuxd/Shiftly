import type { UserRole } from "../types";

export const ROLE_HOME_PATH: Record<UserRole, string> = {
  job_seeker: "/job-seeker",
  vendor: "/vendor",
  admin: "/admin",
  superadmin: "/admin",
};

export function getRoleHomePath(role: UserRole | null): string {
  if (!role) {
    return "/";
  }
  return ROLE_HOME_PATH[role] ?? "/";
}

export const ROLE_PROFILE_PATH: Record<UserRole, string> = {
  job_seeker: "/job-seeker/profile",
  vendor: "/vendor/profile",
  admin: "/admin",
  superadmin: "/admin",
};

export function getRoleProfilePath(role: UserRole | null): string {
  if (!role) {
    return "/";
  }
  return ROLE_PROFILE_PATH[role] ?? "/";
}
