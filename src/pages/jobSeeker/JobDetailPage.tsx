import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { discoverJob, applyToJob } from "../../lib/api";
import { getCurrentIdToken } from "../../lib/auth";
import { useAuth } from "../../context/useAuth";
import { useProfile } from "../../context/useProfile";
import { CompactVerificationBadge } from "../../components/ui/VerificationBadge";
import { FriendlyAlert } from "../../components/ui/FormField";
import type { PublicJob } from "../../types";

function formatPay(rateType: string, rateAmount: number): string {
  const type = rateType === "hourly" ? "/hr" : rateType === "daily" ? "/day" : "";
  return `$${rateAmount.toLocaleString()}${type}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Not specified";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { authenticated, role } = useAuth();
  const { profile, profileLoading, fetchProfile } = useProfile();

  const [job, setJob] = useState<
    (PublicJob & { myApplication?: { status: string } | null }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    if (role === "job_seeker") {
      void fetchProfile();
    }
  }, [role, fetchProfile]);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      let token: string | undefined;
      if (authenticated) {
        token = await getCurrentIdToken();
      }
      const data = await discoverJob(jobId, token);
      setJob(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message === "JOB_NOT_FOUND") {
        setError("Job not found or no longer available.");
      } else {
        setError("Failed to load job details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [jobId, authenticated]);

  useEffect(() => {
    void fetchJob();
  }, [fetchJob]);

  const handleApply = async () => {
    if (!authenticated || !jobId) return;
    setApplying(true);
    setApplyError(null);
    setApplySuccess(false);
    try {
      const token = await getCurrentIdToken();
      const application = await applyToJob(token, jobId);
      setApplySuccess(true);
      setJob((prev) =>
        prev ? { ...prev, myApplication: { status: application.status } } : prev,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setApplyError(message || "Failed to apply. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-2/3 mb-4" />
          <div className="h-4 bg-neutral-200 rounded w-1/3 mb-8" />
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="h-6 bg-neutral-200 rounded w-1/2 mb-4" />
            <div className="h-4 bg-neutral-200 rounded w-full mb-2" />
            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-6" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 bg-neutral-200 rounded" />
              <div className="h-4 bg-neutral-200 rounded" />
              <div className="h-4 bg-neutral-200 rounded" />
              <div className="h-4 bg-neutral-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mx-auto max-w-md py-16">
          <FriendlyAlert icon="error" title="We couldn't load this job">
            {error ?? "Job not found"}
          </FriendlyAlert>
          <Link
            to="/jobs"
            className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
          >
            Browse jobs
          </Link>
        </div>
      </div>
    );
  }

  const isJobSeeker = role === "job_seeker";
  const applicationStatus = job.myApplication?.status;
  const hasApplied = applicationStatus === "applied";
  const hasWithdrawn = applicationStatus === "withdrawn";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Jobs
        </Link>
      </nav>

      {/* Job Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                {job.title}
              </h1>
              <CompactVerificationBadge status={job.vendorVerificationStatus} />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
              <span className="inline-flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {job.location.city}, {job.location.state}, {job.location.country}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-primary-600">
              {formatPay(job.rateType, job.rateAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Application Status Banner */}
      {authenticated && applicationStatus && (
        <div
          className={`mb-6 p-4 rounded-xl border ${
            hasApplied
              ? "bg-green-50 border-green-200 text-green-800"
              : hasWithdrawn
                ? "bg-neutral-50 border-neutral-200 text-neutral-600"
                : applicationStatus === "accepted"
                  ? "bg-primary-50 border-primary-200 text-primary-800"
                  : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {hasApplied && (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">You have applied to this job</span>
              </>
            )}
            {hasWithdrawn && (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-medium">Application withdrawn</span>
              </>
            )}
            {applicationStatus === "accepted" && (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Your application has been accepted!</span>
              </>
            )}
            {applicationStatus === "rejected" && (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-medium">Application not selected</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Job Details Card */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="p-6">
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">About This Job</h2>
            <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Category</p>
                <p className="text-neutral-900 font-medium">{job.jobCategory.charAt(0).toUpperCase() + job.jobCategory.slice(1)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Work Type</p>
                <p className="text-neutral-900 font-medium">{job.workType.charAt(0).toUpperCase() + job.workType.slice(1).replace("-", " ")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Date</p>
                <p className="text-neutral-900 font-medium">{formatDate(job.startDate)}</p>
                {job.endDate && job.endDate !== job.startDate && (
                  <p className="text-sm text-neutral-500">to {formatDate(job.endDate)}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Hours</p>
                <p className="text-neutral-900 font-medium">
                  {job.shiftStart && job.shiftEnd
                    ? `${job.shiftStart} - ${job.shiftEnd}`
                    : "Not specified"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Openings</p>
                <p className="text-neutral-900 font-medium">{job.spotsAvailable} spot{job.spotsAvailable !== 1 ? "s" : ""}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Location</p>
                <p className="text-neutral-900 font-medium">
                  {[job.location.area, job.location.city, job.location.state]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {job.location.address && (
                  <p className="text-sm text-neutral-500">{job.location.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Posted Date */}
          {job.publishedAt && (
            <p className="text-sm text-neutral-400 mb-6">
              Posted {formatDate(job.publishedAt)}
            </p>
          )}
        </div>

        {/* Apply Action */}
        <div className="border-t border-neutral-200 p-6">
          {!authenticated ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-neutral-600 text-sm">
                Sign in to apply for this job.
              </p>
              <Link
                to="/login"
                state={{ from: `/jobs/${jobId}` }}
                className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                Sign In to Apply
              </Link>
            </div>
          ) : !isJobSeeker ? (
            <p className="text-neutral-500 text-sm">
              Only job seekers can apply to jobs.
            </p>
          ) : hasApplied ? (
            <div className="flex items-center gap-2 text-green-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium text-sm">Application submitted</span>
            </div>
          ) : applySuccess ? (
            <div className="flex items-center gap-2 text-green-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium text-sm">Application submitted successfully!</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {applyError && (
                <FriendlyAlert icon="error" title="We couldn't submit your application">
                  {applyError}
                </FriendlyAlert>
              )}
              {!profileLoading &&
                profile &&
                profile.completeness > 0 &&
                profile.completeness < 60 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex items-start gap-2">
                    <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span>
                      Your profile is {profile.completeness}% complete. A more
                      complete profile is more likely to be accepted.{" "}
                      <Link
                        to="/job-seeker/profile/edit"
                        className="font-semibold text-amber-900 underline hover:text-amber-950"
                      >
                        Complete it now
                      </Link>
                    </span>
                  </div>
                )}
              {!profileLoading &&
                authenticated &&
                role === "job_seeker" &&
                profile === null && (
                  <div className="rounded-lg border border-primary-200 bg-primary-50 p-3 text-sm text-primary-800 flex items-start gap-2">
                    <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span>
                      You don&apos;t have a profile yet. Create one before
                      applying to increase your chances.{" "}
                      <Link
                        to="/job-seeker/profile/create"
                        className="font-semibold text-primary-900 underline hover:text-primary-950"
                      >
                        Create profile
                      </Link>
                    </span>
                  </div>
                )}
              <button
                type="button"
                onClick={() => void handleApply()}
                disabled={applying}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm"
              >
                {applying ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Applying...
                  </>
                ) : (
                  "Apply Now"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Withdraw Section */}
      {authenticated && isJobSeeker && hasApplied && job.myApplication && (
        <div className="mt-6">
          <WithdrawSection
            jobId={jobId!}
            onWithdrawn={() => {
              setJob((prev) =>
                prev
                  ? { ...prev, myApplication: { status: "withdrawn" } }
                  : prev,
              );
            }}
          />
        </div>
      )}
    </div>
  );
}

function WithdrawSection({
  jobId,
  onWithdrawn,
}: {
  jobId: string;
  onWithdrawn: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    setError(null);
    try {
      const token = await getCurrentIdToken();
      const { withdrawApplication, getMyApplications } = await import("../../lib/api");
      const applications = await getMyApplications(token);
      const app = applications.find((a) => a.jobId === jobId && a.status === "applied");
      if (!app) {
        setError("Application not found.");
        return;
      }
      await withdrawApplication(token, app.id);
      onWithdrawn();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to withdraw. Please try again.");
    } finally {
      setWithdrawing(false);
      setConfirming(false);
    }
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm text-neutral-500 hover:text-red-600 transition-colors"
      >
        Withdraw application
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-800 mb-1">
        Withdraw this application?
      </p>
      <p className="text-sm text-red-700 mb-3">
        This cannot be undone.
      </p>
      {error && (
        <div className="mb-3">
          <FriendlyAlert icon="error" title="We couldn't withdraw">
            {error}
          </FriendlyAlert>
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void handleWithdraw()}
          disabled={withdrawing}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {withdrawing ? "Withdrawing..." : "Yes, Withdraw"}
        </button>
        <button
          type="button"
          onClick={() => { setConfirming(false); setError(null); }}
          className="px-4 py-2 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
