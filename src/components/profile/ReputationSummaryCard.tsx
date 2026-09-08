import { useEffect, useState } from "react";
import { getCurrentIdToken } from "../../lib/auth";
import { getMyReputation } from "../../lib/api";
import type { ReputationSummary } from "../../types";
import { RatingStars } from "../ui/RatingStars";

function ReputationSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-neutral-100 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-neutral-100 rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-4 bg-neutral-100 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function ReputationSummaryCard({
  userId,
  role,
}: {
  userId?: string;
  role: "job_seeker" | "vendor";
}) {
  const [rep, setRep] = useState<ReputationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const token = await getCurrentIdToken();
        const data = await getMyReputation(token);
        if (!cancelled) setRep(data);
      } catch {
        if (!cancelled) setRep(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, role]);

  if (loading) return <ReputationSkeleton />;
  if (!rep) return null;

  if (rep.ratingCount === 0 && rep.completedJobs === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
          Your reputation
        </p>
        <p className="text-sm text-neutral-500">
          Complete a shift to start building trust with employers.{" "}
          <span className="font-medium text-neutral-700">
            Reliable workers get repeat hires.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
        Your reputation
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div>
          <div className="flex items-center gap-2">
            <RatingStars rating={rep.averageRating ?? 0} size="md" />
            <span className="text-sm text-neutral-500">
              from {rep.ratingCount} review{rep.ratingCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>
            <span className="font-semibold text-neutral-900">
              {rep.completedJobs}
            </span>{" "}
            completed shift{rep.completedJobs === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
}