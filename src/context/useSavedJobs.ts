import { useContext } from "react";
import { SavedJobsContext } from "./SavedJobsContext";

export function useSavedJobs() {
  const ctx = useContext(SavedJobsContext);
  if (!ctx) {
    throw new Error("useSavedJobs must be used within a SavedJobsProvider");
  }
  return ctx;
}