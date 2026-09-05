import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./useAuth";
import {
  getVendorProfile as apiGetVendorProfile,
  createVendorProfile as apiCreateVendorProfile,
  updateVendorProfile as apiUpdateVendorProfile,
  getVendorVerification as apiGetVendorVerification,
  submitVendorVerification as apiSubmitVendorVerification,
} from "../lib/api";
import { getCurrentIdToken } from "../lib/auth";
import { humanizeApiError } from "../lib/errors";
import type { VendorProfile, VendorVerificationInfo } from "../types";

export interface VendorProfileContextValue {
  profile: VendorProfile | null;
  profileLoading: boolean;
  profileError: string | null;
  verification: VendorVerificationInfo | null;
  fetchProfile: () => Promise<void>;
  refreshVerification: () => Promise<void>;
  saveProfile: (
    data: Omit<VendorProfile, "id" | "completeness" | "verification">,
  ) => Promise<VendorProfile>;
  submitVerification: () => Promise<VendorVerificationInfo>;
}

export const VendorProfileContext =
  createContext<VendorProfileContextValue | null>(null);

export function VendorProfileProvider({ children }: { children: ReactNode }) {
  const { authenticated } = useAuth();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [verification, setVerification] = useState<VendorVerificationInfo | null>(
    null,
  );

  const fetchProfile = useCallback(async (): Promise<void> => {
    if (!authenticated) {
      setProfile(null);
      setVerification(null);
      return;
    }

    setProfileLoading(true);
    setProfileError(null);

    try {
      const token = await getCurrentIdToken();
      const data = await apiGetVendorProfile(token);
      setProfile(data);
      setVerification(data.verification);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message === "VENDOR_PROFILE_NOT_FOUND") {
        setProfile(null);
        setVerification(null);
      } else {
        setProfileError(
          humanizeApiError(
            message,
            "We couldn't load your business profile. Please try again.",
          ),
        );
      }
    } finally {
      setProfileLoading(false);
    }
  }, [authenticated]);

  const refreshVerification = useCallback(async (): Promise<void> => {
    if (!authenticated) return;
    try {
      const token = await getCurrentIdToken();
      const data = await apiGetVendorVerification(token);
      setVerification(data);
      if (data.status === "approved") {
        await fetchProfile();
      }
    } catch {
      // Non-blocking background refresh.
    }
  }, [authenticated, fetchProfile]);

  const saveProfile = useCallback(
    async (
      data: Omit<VendorProfile, "id" | "completeness" | "verification">,
    ): Promise<VendorProfile> => {
      const token = await getCurrentIdToken();

      let result: VendorProfile;
      if (profile) {
        result = await apiUpdateVendorProfile(token, data);
      } else {
        result = await apiCreateVendorProfile(token, data);
      }

      setProfile(result);
      return result;
    },
    [profile],
  );

  const submitVerification = useCallback(async (): Promise<VendorVerificationInfo> => {
    const token = await getCurrentIdToken();
    const result = await apiSubmitVendorVerification(token);
    setVerification(result);
    return result;
  }, []);

  const value = useMemo<VendorProfileContextValue>(
    () => ({
      profile,
      profileLoading,
      profileError,
      verification,
      fetchProfile,
      refreshVerification,
      saveProfile,
      submitVerification,
    }),
    [
      profile,
      profileLoading,
      profileError,
      verification,
      fetchProfile,
      refreshVerification,
      saveProfile,
      submitVerification,
    ],
  );

  return (
    <VendorProfileContext.Provider value={value}>
      {children}
    </VendorProfileContext.Provider>
  );
}
