import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getRecommendedJobs } from "../../lib/api";
import { getCurrentIdToken } from "../../lib/auth";
import { CompactVerificationBadge } from "../ui/VerificationBadge";
import { getFriendlyError } from "../../lib/errors";
import type { RecommendedJob } from "../../types";

function formatPay(rateType: string, rateAmount: number): string {
  const type = rateType === "hourly" ? "/hr" : rateType === "daily" ? "/day" : "";
  return `$${rateAmount.toLocaleString()}${type}`;
}

function formatDistance(km: number | null): string {
  if (km === null) return "";
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}

function MatchPill({ children, kind }: { children: string; kind: string }) {
  const tones: Record<string, string> = {
    availability: "bg-emerald-50 text-emerald-700 border-emerald-200",
    location: "bg-primary-50 text-primary-700 border-primary-200",
    category: "bg-accent-50 text-accent-800 border-accent-200",
    "work-type": "bg-neutral-50 text-neutral-600 border-neutral-200",
    skills: "bg-amber-50 text-amber-700 border-amber-200",
    pay: "bg-neutral-50 text-neutral-600 border-neutral-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
        tones[kind] ?? tones["work-type"]
      }`}
    >
      {kind === "availability" && (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {children}
    </span>
  );
}

function RecommendedCard({ job }: { job: RecommendedJob }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group block rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-card-hover hover:border-primary-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-neutral-900 leading-snug group-hover:text-primary-800 transition-colors">
                {job.title}
              </h3>
              <CompactVerificationBadge status={job.vendorVerificationStatus} />
            </div>
            {job.distanceKm !== null && (
              <p className="mt-0.5 text-xs text-neutral-500">
                {formatDistance(job.distanceKm)}
              </p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-accent-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
            {formatPay(job.rateType, job.rateAmount)}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {job.reasons.slice(0, 4).map((r, idx) => (
            <MatchPill key={idx} kind={r.kind}>
              {r.text}
            </MatchPill>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-3">
          <span className="text-xs text-neutral-400">
            {[job.location.area, job.location.city, job.location.state]
              .filter(Boolean)
              .join(", ")}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 group-hover:text-primary-800">
            View Shift
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function RecommendedJobs() {
  const [jobs, setJobs] = useState<RecommendedJob[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getCurrentIdToken();
        const data = await getRecommendedJobs(token, 6);
        if (!cancelled) setJobs(data);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(getFriendlyError(err, "We couldn't load your recommendations."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5 animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-2/3 mb-2" />
            <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2" />
            <div className="h-4 bg-neutral-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (!jobs || jobs.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-600 mb-1">
            Recommended for you
          </p>
          <h2 className="text-xl font-bold text-neutral-900">
            Shifts that fit your profile
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <RecommendedCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}