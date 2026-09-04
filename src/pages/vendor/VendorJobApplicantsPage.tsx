import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { getCurrentIdToken } from "../../lib/auth";
import {
  getVendorJobApplications,
  acceptApplication,
  rejectApplication,
  createConversation,
  getJob,
} from "../../lib/api";
import type { VendorApplicationWithJob, Job } from "../../types";
import { APPLICATION_STATUS_LABELS } from "../../types";
import { FriendlyAlert } from "../../components/ui/FormField";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
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
      {APPLICATION_STATUS_LABELS[status as keyof typeof APPLICATION_STATUS_LABELS] ?? status}
    </span>
  );
}

export default function VendorJobApplicantsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [applications, setApplications] = useState<VendorApplicationWithJob[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getCurrentIdToken();
      const [apps, jobData] = await Promise.all([
        getVendorJobApplications(token, jobId),
        getJob(token, jobId).catch(() => null),
      ]);
      setApplications(apps);
      setJob(jobData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load applicants.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAccept(app: VendorApplicationWithJob) {
    setActionError(null);
    setActingId(app.id);
    try {
      const token = await getCurrentIdToken();
      await acceptApplication(token, app.id);
      await load();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(app: VendorApplicationWithJob) {
    setActionError(null);
    setActingId(app.id);
    try {
      const token = await getCurrentIdToken();
      await rejectApplication(token, app.id);
      await load();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActingId(null);
    }
  }

  async function handleStartMessaging(app: VendorApplicationWithJob) {
    setActionError(null);
    setActingId(app.id);
    try {
      const token = await getCurrentIdToken();
      await createConversation(token, {
        jobSeekerId: app.jobSeekerId,
        applicationId: app.id,
        jobId: app.jobId,
      });
      window.location.href = "/vendor/messages";
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to start conversation.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link
          to="/vendor/jobs"
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          &larr; My Jobs
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">
          Applicants{job ? ` for ${job.title}` : ""}
        </h1>
        {job && (
          <p className="mt-1 text-neutral-500">
            {job.spotsAvailable} spot{job.spotsAvailable !== 1 ? "s" : ""} remaining
          </p>
        )}
      </div>

      {actionError && (
        <div className="mb-4">
          <FriendlyAlert icon="error" title="We couldn't complete that action">
            {actionError}
          </FriendlyAlert>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : error ? (
        <FriendlyAlert icon="error" title="We couldn't load the applicants">
          {error}
        </FriendlyAlert>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
          <p className="text-neutral-500">No applications yet for this job.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-semibold text-neutral-900">
                      Worker #{app.jobSeekerId.slice(0, 8)}
                    </span>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
                    {app.appliedAt && (
                      <span>Applied {formatDate(app.appliedAt)}</span>
                    )}
                    {app.updatedAt && app.updatedAt !== app.appliedAt && (
                      <span>Updated {formatDate(app.updatedAt)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {app.status === "applied" && (
                    <>
                      <button
                        type="button"
                        disabled={actingId === app.id}
                        onClick={() => void handleAccept(app)}
                        className="inline-flex items-center rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
                      >
                        {actingId === app.id ? "..." : "Accept"}
                      </button>
                      <button
                        type="button"
                        disabled={actingId === app.id}
                        onClick={() => void handleReject(app)}
                        className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {app.status === "accepted" && (
                    <button
                      type="button"
                      disabled={actingId === app.id}
                      onClick={() => void handleStartMessaging(app)}
                      className="inline-flex items-center rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
                    >
                      {actingId === app.id ? "..." : "Message"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
