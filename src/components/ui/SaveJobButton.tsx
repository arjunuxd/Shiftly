import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useSavedJobs } from "../../context/useSavedJobs";
import { Link } from "react-router-dom";

export default function SaveJobButton({
  jobId,
  className = "",
}: {
  jobId: string;
  className?: string;
}) {
  const { authenticated } = useAuth();
  const { isSaved, toggleSaved, savedLoading } = useSavedJobs();
  const [busy, setBusy] = useState(false);
  const saved = isSaved(jobId);

  if (!authenticated) {
    return (
      <Link
        to="/login"
        state={{ from: `/jobs/${jobId}` }}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors ${className}`}
        aria-label="Sign in to save this job"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
        Save
      </Link>
    );
  }

  const handleClick = async () => {
    if (busy || savedLoading) return;
    setBusy(true);
    try {
      await toggleSaved(jobId);
    } catch {
      // Ignore - the saved jobs list stays unchanged on failure.
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={busy || savedLoading}
      aria-pressed={saved}
      aria-label={saved ? "Remove this job from saved jobs" : "Save this job"}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
        saved
          ? "border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100"
          : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
      } ${className}`}
    >
      {saved ? (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      )}
      {saved ? "Saved" : "Save"}
    </button>
  );
}