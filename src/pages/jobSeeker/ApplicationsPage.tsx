import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getMyApplications, withdrawApplication, createConversation } from "../../lib/api";
import { getCurrentIdToken } from "../../lib/auth";
import JobSeekerNav from "../../components/jobSeeker/JobSeekerNav";
import RateCandidateModal from "../../components/vendor/RateCandidateModal";
import type { Application, ApplicationStatus } from "../../types";
import { APPLICATION_STATUS_LABELS } from "../../types";
import { FriendlyAlert } from "../../components/ui/FormField";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  applied: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "under-review": "bg-sky-50 text-sky-700 border-sky-200",
  accepted: "bg-accent-50 text-accent-800 border-accent-200",
  hired: "bg-accent-50 text-accent-800 border-accent-200",
  completed: "bg-neutral-100 text-neutral-700 border-neutral-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  withdrawn: "bg-neutral-100 text-neutral-500 border-neutral-200",
  cancelled: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

function StatusBadge({ status }: { status: Application["status"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
        STATUS_STYLES[status] ?? STATUS_STYLES.applied
      }`}
    >
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {APPLICATION_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function ApplicationCard({
  application,
  onWithdrawn,
}: {
  application: Application;
  onWithdrawn: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [rating, setRating] = useState(false);
  const [rated, setRated] = useState(false);

  const confirmWithdraw = async () => {
    setWithdrawing(true);
    try {
      const token = await getCurrentIdToken();
      await withdrawApplication(token, application.id);
      onWithdrawn(application.id);
    } catch {
      // error handled silently
    } finally {
      setWithdrawing(false);
      setConfirming(false);
    }
  };

  async function handleStartMessaging() {
    setMessaging(true);
    try {
      const token = await getCurrentIdToken();
      await createConversation(token, {
        jobSeekerId: application.jobSeekerId,
        applicationId: application.id,
        jobId: application.jobId,
      });
      window.location.href = "/job-seeker/messages";
    } catch {
      // error handled silently
    } finally {
      setMessaging(false);
    }
  }

  const canWithdraw = application.status === "applied";
  const canMessage = application.status === "accepted" || application.status === "hired";
  const canRate = application.status === "completed";

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-2 flex-wrap">
            <Link
              to={`/jobs/${application.jobId}`}
              className="text-lg font-semibold text-neutral-900 hover:text-primary-700 transition-colors leading-snug"
            >
              {application.jobTitle ?? `Job #${application.jobId.slice(0, 8)}`}
            </Link>
            <StatusBadge status={application.status} />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
            {application.appliedAt && (
              <span className="inline-flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Applied {formatDate(application.appliedAt)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/jobs/${application.jobId}`}
            className="px-4 py-2 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
          >
            View Job
          </Link>
          {canMessage && (
            <button
              type="button"
              disabled={messaging}
              onClick={() => void handleStartMessaging()}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {messaging ? "..." : "Message"}
            </button>
          )}
          {canWithdraw && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="px-4 py-2 text-sm text-neutral-500 hover:text-red-600 transition-colors"
            >
              Withdraw
            </button>
          )}
          {canRate && (
            <button
              type="button"
              onClick={() => setRating(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-amber-300 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-100 transition-colors"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              Rate employer
            </button>
          )}
        </div>
      </div>

      {rated && (
        <div className="mt-3">
          <FriendlyAlert icon="success" title="Thank you!">
            Your review helps other workers trust this employer.
          </FriendlyAlert>
        </div>
      )}

      {rating && (
        <RateCandidateModal
          applicationId={application.id}
          candidateName="this employer"
          title={`Rate ${application.jobTitle ?? "this employer"}`}
          subtitle="Your rating builds this employer's reputation and helps other workers trust them."
          placeholder="Was this employer reliable, fair, and prompt with payment?"
          onClose={() => setRating(false)}
          onRated={() => {
            setRating(false);
            setRated(true);
          }}
        />
      )}

      <ConfirmDialog
        open={confirming}
        title="Withdraw this application?"
        message="The employer will no longer see your application. This can't be undone."
        confirmLabel="Withdraw application"
        busy={withdrawing}
        onConfirm={() => void confirmWithdraw()}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 bg-neutral-200 rounded w-48" />
        <div className="h-6 bg-neutral-200 rounded-full w-20" />
      </div>
      <div className="h-4 bg-neutral-200 rounded w-32" />
    </div>
  );
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getCurrentIdToken();
      const data = await getMyApplications(token);
      setApplications(data);
    } catch {
      setError("We couldn't load your applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  const handleWithdrawn = (applicationId: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: "withdrawn" as const } : app,
      ),
    );
  };

  const activeCount = applications.filter(
    (a) =>
      a.status === "applied" ||
      a.status === "under-review" ||
      a.status === "accepted" ||
      a.status === "hired",
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <JobSeekerNav />
      <div className="mt-6 mb-8 border-b border-neutral-200 pb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent-600 mb-2">
          My applications
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 mb-1">
          Applications
        </h1>
        <p className="text-neutral-500">
          Track the status of every shift you&apos;ve applied to.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <div className="mx-auto max-w-md">
          <FriendlyAlert icon="error" title="We couldn't load your applications">
            {error}
          </FriendlyAlert>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => void fetchApplications()}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 mb-4">
            <svg className="h-7 w-7 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-neutral-900 mb-1">
            No applications yet
          </p>
          <p className="text-neutral-500 text-sm mb-6 max-w-md mx-auto">
            When you apply to a shift, it will show up here so you can track
            its status.
          </p>
          <Link
            to="/jobs"
            className="inline-block px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            Browse shifts
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-neutral-500">
              {applications.length} {applications.length === 1 ? "application" : "applications"}
              {activeCount > 0 && (
                <span className="text-neutral-400">
                  {" "}· {activeCount} active
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onWithdrawn={handleWithdrawn}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}