import type { Profile } from "../types";

export interface ShiftReadiness {
  ready: boolean;
  profilePercent: number;
  checks: {
    key: string;
    label: string;
    done: boolean;
    detail?: string;
  }[];
}

export const SHIFT_READY_PROFILE_THRESHOLD = 60;

export function computeShiftReadiness(
  profile: Profile | null,
  emailVerified: boolean,
): ShiftReadiness {
  if (!profile) {
    return {
      ready: false,
      profilePercent: 0,
      checks: [
        { key: "email", label: "Email", done: emailVerified, detail: emailVerified ? "Verified" : "Not verified" },
        { key: "profile", label: "Profile", done: false, detail: "Not started" },
        { key: "availability", label: "Availability", done: false, detail: "Not added" },
        { key: "skills", label: "Skills", done: false, detail: "Not added" },
        { key: "resume", label: "Resume", done: false, detail: "Not added" },
      ],
    };
  }

  const completeness = profile.completeness ?? 0;
  const emailDone = emailVerified;
  const profileDone = completeness >= SHIFT_READY_PROFILE_THRESHOLD;
  const availabilityDone = Array.isArray(profile.availability) && profile.availability.length > 0;
  const skillsDone = Array.isArray(profile.skills) && profile.skills.length > 0;
  const resumeDone =
    typeof profile.resumeUrl === "string" && profile.resumeUrl.trim().length > 0;

  const checks = [
    {
      key: "email",
      label: "Email",
      done: emailDone,
      detail: emailDone ? "Verified" : "Not verified",
    },
    {
      key: "profile",
      label: "Profile",
      done: profileDone,
      detail: `${completeness}% complete`,
    },
    {
      key: "availability",
      label: "Availability",
      done: availabilityDone,
      detail: availabilityDone ? "Added" : "Not added",
    },
    {
      key: "skills",
      label: "Skills",
      done: skillsDone,
      detail: skillsDone ? "Added" : "Not added",
    },
    {
      key: "resume",
      label: "Resume",
      done: resumeDone,
      detail: resumeDone ? "Added" : "Not added",
    },
  ];

  return {
    ready: emailDone && profileDone && availabilityDone && skillsDone && resumeDone,
    profilePercent: completeness,
    checks,
  };
}