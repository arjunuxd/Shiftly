import type { UserRole } from "../types";

export const ROLE_HOME_PATH: Record<UserRole, string> = {
  job_seeker: "/job-seeker",
  vendor: "/vendor",
  superadmin: "/admin",
};

export function getRoleHomePath(role: UserRole | null): string {
  if (!role) {
    return "/";
  }
  return ROLE_HOME_PATH[role] ?? "/";
}
