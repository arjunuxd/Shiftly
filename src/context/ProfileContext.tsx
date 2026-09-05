import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./useAuth";
import {
  getProfile as apiGetProfile,
  createProfile as apiCreateProfile,
  updateProfile as apiUpdateProfile,
} from "../lib/api";
import { getCurrentIdToken } from "../lib/auth";
import { humanizeApiError } from "../lib/errors";
import type { Profile } from "../types";

export interface ProfileContextValue {
  profile: Profile | null;
  profileLoading: boolean;
  profileError: string | null;
  fetchProfile: () => Promise<void>;
  saveProfile: (data: Omit<Profile, "id" | "completeness">) => Promise<Profile>;
}

export const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { authenticated } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (): Promise<void> => {
    if (!authenticated) {
      setProfile(null);
      return;
    }

    setProfileLoading(true);
    setProfileError(null);

    try {
      const token = await getCurrentIdToken();
      const data = await apiGetProfile(token);
      setProfile(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message === "PROFILE_NOT_FOUND") {
        setProfile(null);
      } else {
        setProfileError(
          humanizeApiError(
            message,
            "We couldn't load your profile. Please try again.",
          ),
        );
      }
    } finally {
      setProfileLoading(false);
    }
  }, [authenticated]);

  const saveProfile = useCallback(
    async (data: Omit<Profile, "id" | "completeness">): Promise<Profile> => {
      const token = await getCurrentIdToken();

      let result: Profile;
      if (profile) {
        result = await apiUpdateProfile(token, data);
      } else {
        result = await apiCreateProfile(token, data);
      }

      setProfile(result);
      return result;
    },
    [profile],
  );

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      profileLoading,
      profileError,
      fetchProfile,
      saveProfile,
    }),
    [profile, profileLoading, profileError, fetchProfile, saveProfile],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
