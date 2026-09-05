import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { discoverJob, applyToJob } from "../../lib/api";
import { getCurrentIdToken } from "../../lib/auth";
import { useAuth } from "../../context/useAuth";
import { useProfile } from "../../context/useProfile";
import { CompactVerificationBadge } from "../../components/ui/VerificationBadge";
import { FriendlyAlert } from "../../components/ui/FormField";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataErrorState from "../../components/ui/DataErrorState";
import { getFriendlyError } from "../../lib/errors";
import type { PublicJob } from "../../types";

const PROFILE_COMPLETION_THRESHOLD = 50;

function formatPay(rateType: string, rateAmount: number): string {
  const type = rateType === "hourly" ? "/hr" : rateType === "daily" ? "/day" : "";
  return `$${rateAmount.toLocaleString()}${type}`;
}

function formatPayLong(rateType: string, rateAmount: number): string {
  const type =
    rateType === "hourly" ? "/ hour"
    : rateType === "daily" ? "/ day"
    : " total";
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

function titleCase(str: string): string {
  return str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
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
  const [confirming, setConfirming] = useState(false);
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
      setError(getFriendlyError(err, "Something went wrong while loading this job. Please try again."));
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
    try {
      const token = await getCurrentIdToken();
      const application = await applyToJob(token, jobId);
      setApplySuccess(true);
      setJob((prev) =>
        prev ? { ...prev, myApplication: { status: application.status } } : prev,
      );
    } catch (err: unknown) {
      setApplyError(getFriendlyError(err, "We couldn't submit your application. Please try again."));
    } finally {
      setApplying(false);
      setConfirming(false);
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
    if (error !== "JOB_NOT_FOUND") {
      return (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <DataErrorState
            title="We couldn't load this job"
            message={error ?? undefined}
            onRetry={() => void fetchJob()}
          />
        </div>
      );
    }
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mx-auto max-w-md py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 mb-4">
            <svg className="h-7 w-7 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mb-1">
            This job isn&apos;t available
          </h1>
          <p className="text-neutral-500 text-sm mb-6">
            It may have been removed or the link may be out of date.
          </p>
          <Link
            to="/jobs"
            className="inline-block px-6 py-3 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            Browse all shifts
          </Link>
        </div>
      </div>
    );
  }

  const isJobSeeker = role === "job_seeker";
  const applicationStatus = job.myApplication?.status;
  const hasApplied = applicationStatus === "applied";
  const hasWithdrawn = applicationStatus === "withdrawn" || applicationStatus === "cancelled";
  const isClosed = job.status === "closed";
  const completeness = profile?.completeness ?? 0;
  const profileGated =
    isJobSeeker && profileLoading === false && (profile === null || completeness < PROFILE_COMPLETION_THRESHOLD);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Jobs
        </Link>
      </nav>

      {/* Status banner */}
      {authenticated && applicationStatus && (
        <div
          className={`mb-6 p-4 rounded-xl border ${
            hasApplied
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : hasWithdrawn
                ? "bg-neutral-100 border-neutral-200 text-neutral-600"
                : applicationStatus === "accepted"
                  ? "bg-accent-50 border-accent-200 text-accent-800"
                  : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
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
              {applicationStatus === "under-review" && (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Application under review</span>
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
            {hasApplied && (
              <Link
                to="/job-seeker/applications"
                className="text-sm font-semibold underline hover:opacity-80"
              >
                Manage application
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            {job.title}
          </h1>
          <CompactVerificationBadge status={job.vendorVerificationStatus} />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {[job.location.area, job.location.city, job.location.state]
              .filter(Boolean)
              .join(", ")}
          </span>
          <span className="inline-flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            {titleCase(job.workType)} · {titleCase(job.jobCategory)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* How much */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              How much
            </p>
            <p className="text-3xl font-extrabold text-neutral-900">
              {formatPay(job.rateType, job.rateAmount)}
              <span className="ml-2 text-sm font-medium text-neutral-500">
                {job.rateType === "fixed" ? "fixed rate" : formatPayLong(job.rateType, job.rateAmount)}
              </span>
            </p>
            {job.rateType !== "fixed" && (
              <p className="mt-1 text-sm text-neutral-500">
                {job.spotsAvailable} opening{job.spotsAvailable !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* About */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">
              About this shift
            </h2>
            <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {/* When & where */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              When &amp; where
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                  <svg className="h-5 w-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Date</dt>
                  <dd className="font-medium text-neutral-900">{formatDate(job.startDate)}</dd>
                  {job.endDate && job.endDate !== job.startDate && (
                    <dd className="text-sm text-neutral-500">
                      to {formatDate(job.endDate)}
                    </dd>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                  <svg className="h-5 w-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Shift hours</dt>
                  <dd className="font-medium text-neutral-900">
                    {job.shiftStart && job.shiftEnd
                      ? `${job.shiftStart} – ${job.shiftEnd}`
                      : "Not specified"}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                  <svg className="h-5 w-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Location</dt>
                  <dd className="font-medium text-neutral-900">
                    {[job.location.area, job.location.city, job.location.state]
                      .filter(Boolean)
                      .join(", ")}
                  </dd>
                  {job.location.country && (
                    <dd className="text-sm text-neutral-500">{job.location.country}</dd>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                  <svg className="h-5 w-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Openings</dt>
                  <dd className="font-medium text-neutral-900">
                    {job.spotsAvailable} spot{job.spotsAvailable !== 1 ? "s" : ""}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>

        {/* Sidebar / Apply */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            {!authenticated ? (
              <>
                <Link
                  to="/login"
                  state={{ from: `/jobs/${jobId}` }}
                  className="block w-full px-6 py-3 bg-primary-600 text-white text-center font-semibold rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  Sign in to apply
                </Link>
                <p className="text-xs text-neutral-500 text-center">
                  Create a free account or sign in to apply for this shift.
                </p>
              </>
            ) : !isJobSeeker ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                Only job seekers can apply for shifts.{" "}
                <Link to="/vendor/jobs" className="font-semibold text-primary-700 underline">
                  Manage jobs
                </Link>
              </div>
            ) : hasApplied || applySuccess ? (
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 mb-3">
                  <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-semibold text-neutral-900">Application sent</p>
                <p className="text-sm text-neutral-500 mt-1">
                  The employer will review your profile.
                </p>
                <Link
                  to="/job-seeker/applications"
                  className="mt-4 inline-block text-sm font-semibold text-primary-700 underline hover:text-primary-800"
                >
                  Track your applications
                </Link>
              </div>
            ) : isClosed ? (
              <div className="text-center">
                <p className="font-semibold text-neutral-900">
                  Applications closed
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  This shift is no longer accepting applications.
                </p>
              </div>
            ) : profileGated ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-accent-200 bg-accent-50 p-4 text-sm text-accent-800">
                  <p className="font-semibold mb-1">
                    {profile === null
                      ? "Complete your profile before applying"
                      : `Your profile is ${completeness}% complete`}
                  </p>
                  <p className="text-accent-900/80">
                    Employers review your profile when you apply. Finish yours to
                    unlock applications.
                  </p>
                </div>
                <Link
                  to={
                    profile === null
                      ? "/job-seeker/profile/create"
                      : "/job-seeker/profile/edit"
                  }
                  className="block w-full px-6 py-3 bg-primary-600 text-white text-center font-semibold rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  {profile === null ? "Create your profile" : "Complete your profile"}
                </Link>
              </div>
            ) : profileLoading ? (
              <div className="h-12 rounded-lg bg-neutral-100 animate-pulse" />
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors text-sm shadow-sm"
                >
                  Apply now
                </button>
                <p className="text-xs text-neutral-500 text-center">
                  Applying takes under a minute.
                </p>
              </>
            )}

            {applyError && (
              <FriendlyAlert icon="error" title="We couldn't submit your application">
                {applyError}
              </FriendlyAlert>
            )}

            {/* Employer card */}
            <div className="border-t border-neutral-200 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                About the employer
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 font-bold text-primary-800 text-sm">
                  V
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Verified employer
                  </p>
                  <p className="text-xs text-neutral-500">
                    {job.vendorVerificationStatus === "approved"
                      ? "Identity and business verified by Shiftly"
                      : "Business published through Shiftly"}
                  </p>
                </div>
              </div>
            </div>

            {job.publishedAt && (
              <div className="border-t border-neutral-200 pt-4 text-xs text-neutral-400">
                Posted {formatDate(job.publishedAt)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Withdraw */}
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

      <ConfirmDialog
        open={confirming}
        title={`Apply to "${job.title}"?`}
        message="The employer will see your profile and can review it right away. Application can't be duplicated."
        confirmLabel="Confirm application"
        busy={applying}
        onConfirm={() => void handleApply()}
        onCancel={() => setConfirming(false)}
      />
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
      setError(getFriendlyError(err, "We couldn't withdraw your application. Please try again."));
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
      <p className="text-sm text-red-700 mb-3">This cannot be undone.</p>
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