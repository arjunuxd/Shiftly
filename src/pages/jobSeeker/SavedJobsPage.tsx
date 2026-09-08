import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { getCurrentIdToken } from "../../lib/auth";
import { getSavedJobs } from "../../lib/api";
import type { SavedJobItem } from "../../types";
import SaveJobButton from "../../components/ui/SaveJobButton";
import JobSeekerNav from "../../components/jobSeeker/JobSeekerNav";

function formatSavedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function EmptySavedState() {
  return (
    <div className="text-center py-16 rounded-2xl border-2 border-dashed border-neutral-200">
      <svg
        className="h-12 w-12 text-neutral-300 mx-auto mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
        />
      </svg>
      <h2 className="text-lg font-bold text-neutral-900 mb-1">
        No saved jobs yet
      </h2>
      <p className="text-sm text-neutral-500 mb-6">
        Browse jobs and tap "Save" to bookmark shifts you're interested in.
      </p>
      <Link
        to="/jobs"
        className="inline-flex items-center gap-2 px-5 py-3 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
      >
        Explore Jobs
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </div>
  );
}

export default function SavedJobsPage() {
  const { authenticated } = useAuth();
  const [items, setItems] = useState<SavedJobItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!authenticated) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const token = await getCurrentIdToken();
        const data = await getSavedJobs(token);
        if (!cancelled) setItems(data.saved);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authenticated]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <JobSeekerNav />
        <h1 className="mt-6 text-2xl font-bold text-neutral-900 mb-6">Saved Jobs</h1>
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 bg-neutral-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <JobSeekerNav />
      <h1 className="mt-6 text-2xl font-bold text-neutral-900 mb-6">Saved Jobs</h1>

      {!items || items.length === 0 ? (
        <EmptySavedState />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-neutral-500">
            {items.length} saved job{items.length === 1 ? "" : "s"}
          </p>
          {items.map((item) => (
            <div
              key={item.jobId}
              className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/jobs/${item.jobId}`}
                      className="text-base font-semibold text-neutral-900 hover:text-primary-700 transition-colors"
                    >
                      {item.title ?? "Saved shift"}
                    </Link>
                    {item.status === "closed" && (
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 border border-neutral-200">
                        Closed
                      </span>
                    )}
                  </div>
                  {item.vendorName && (
                    <p className="text-sm text-neutral-500 mt-0.5">
                      {item.vendorName}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-neutral-500">
                    {item.city && item.state && (
                      <span className="inline-flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {item.city}, {item.state}
                      </span>
                    )}
                    {typeof item.rateAmount === "number" && (
                      <span className="font-medium text-neutral-700">
                        ${item.rateAmount.toLocaleString()}
                        {item.rateType === "hourly" ? "/hr" : item.rateType === "daily" ? "/day" : ""}
                      </span>
                    )}
                    {item.savedAt && (
                      <span>Saved {formatSavedDate(item.savedAt)}</span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <SaveJobButton jobId={item.jobId} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}