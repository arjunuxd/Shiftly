import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./useAuth";
import { getCurrentIdToken } from "../lib/auth";
import {
  getSavedJobs as apiGetSavedJobs,
  saveJob as apiSaveJob,
  unsaveJob as apiUnsaveJob,
} from "../lib/api";
import type { SavedJobItem } from "../types";

export interface SavedJobsContextValue {
  savedJobIds: string[];
  savedLoading: boolean;
  isSaved: (jobId: string) => boolean;
  toggleSaved: (jobId: string) => Promise<void>;
  refreshSaved: () => Promise<void>;
  savedAt: (jobId: string) => string | null;
}

export const SavedJobsContext = createContext<SavedJobsContextValue | null>(
  null,
);

export function SavedJobsProvider({ children }: { children: ReactNode }) {
  const { authenticated } = useAuth();
  const [saved, setSaved] = useState<SavedJobItem[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  const refreshSaved = useCallback(async (): Promise<void> => {
    if (!authenticated) {
      setSaved([]);
      return;
    }
    setSavedLoading(true);
    try {
      const token = await getCurrentIdToken();
      const data = await apiGetSavedJobs(token);
      setSaved(data.saved ?? []);
    } catch {
      setSaved([]);
    } finally {
      setSavedLoading(false);
    }
  }, [authenticated]);

  useEffect(() => {
    if (authenticated) {
      void refreshSaved();
    } else {
      setSaved([]);
    }
  }, [authenticated, refreshSaved]);

  const isSaved = useCallback(
    (jobId: string) => saved.some((s) => s.jobId === jobId),
    [saved],
  );

  const savedAt = useCallback(
    (jobId: string) => saved.find((s) => s.jobId === jobId)?.savedAt ?? null,
    [saved],
  );

  const toggleSaved = useCallback(
    async (jobId: string): Promise<void> => {
      await refreshSaved();
      const token = await getCurrentIdToken();
      if (isSaved(jobId)) {
        await apiUnsaveJob(token, jobId);
        setSaved((prev) => prev.filter((s) => s.jobId !== jobId));
      } else {
        const item = await apiSaveJob(token, jobId);
        setSaved((prev) => [item, ...prev]);
      }
    },
    [refreshSaved, isSaved],
  );

  const value = useMemo<SavedJobsContextValue>(
    () => ({
      savedJobIds: saved.map((s) => s.jobId),
      savedLoading,
      isSaved,
      toggleSaved,
      refreshSaved,
      savedAt,
    }),
    [saved, savedLoading, isSaved, toggleSaved, refreshSaved, savedAt],
  );

  return (
    <SavedJobsContext.Provider value={value}>
      {children}
    </SavedJobsContext.Provider>
  );
}