import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getMyApplications, withdrawApplication, createConversation } from "../../lib/api";
import { getCurrentIdToken } from "../../lib/auth";
import type { Application } from "../../types";
import { APPLICATION_STATUS_LABELS } from "../../types";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: Application["status"] }) {
  const styles: Record<string, string> = {
    applied: "bg-green-50 text-green-700 border-green-200",
    withdrawn: "bg-neutral-50 text-neutral-600 border-neutral-200",
    accepted: "bg-primary-50 text-primary-700 border-primary-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
        styles[status] ?? styles.applied
      }`}
    >
      {APPLICATION_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function ApplicationCard({
  application,
  onWithdraw,
}: {
  application: Application;
  onWithdraw: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [messaging, setMessaging] = useState(false);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      const token = await getCurrentIdToken();
      await withdrawApplication(token, application.id);
      onWithdraw(application.id);
    } catch {
      // error handled silently for MVP
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

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-2">
            <Link
              to={`/jobs/${application.jobId}`}
              className="text-lg font-semibold text-neutral-900 hover:text-primary-600 transition-colors leading-snug"
            >
              Job #{application.jobId.slice(0, 8)}
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

          {application.status === "applied" && (
            <>
              {confirming ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleWithdraw()}
                    disabled={withdrawing}
                    className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {withdrawing ? "..." : "Confirm"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="px-3 py-2 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="px-4 py-2 text-sm text-neutral-500 hover:text-red-600 transition-colors"
                >
                  Withdraw
                </button>
              )}
            </>
          )}
          {application.status === "accepted" && (
            <button
              type="button"
              disabled={messaging}
              onClick={() => void handleStartMessaging()}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {messaging ? "..." : "Message Vendor"}
            </button>
          )}
        </div>
      </div>
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to load applications.");
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          My Applications
        </h1>
        <p className="text-neutral-500">
          Track the status of your job applications.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-neutral-700 font-medium mb-2">Something went wrong</p>
          <p className="text-neutral-500 text-sm mb-4">{error}</p>
          <button
            type="button"
            onClick={() => void fetchApplications()}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-neutral-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-neutral-700 font-medium mb-2">No applications yet</p>
          <p className="text-neutral-500 text-sm mb-4">
            You haven&apos;t applied to any jobs yet. Start browsing available shifts.
          </p>
          <Link
            to="/jobs"
            className="inline-block px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-neutral-500 mb-4">
            {applications.length} {applications.length === 1 ? "application" : "applications"}
          </p>
          <div className="flex flex-col gap-4">
            {applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onWithdraw={handleWithdrawn}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
