import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getCurrentIdToken } from "../../lib/auth";
import {
  getMyJobs,
  setJobStatus,
} from "../../lib/api";
import type { Job } from "../../types";
import { JOB_CATEGORIES, WORK_TYPES, RATE_TYPES } from "../../types";
import { FriendlyAlert } from "../../components/ui/FormField";

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  JOB_CATEGORIES.map((c) => [c.value, c.label]),
);
const WORK_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  WORK_TYPES.map((w) => [w.value, w.label]),
);
const RATE_LABELS: Record<string, string> = Object.fromEntries(
  RATE_TYPES.map((r) => [r.value, r.label]),
);

function StatusPill({ status }: { status: Job["status"] }) {
  const styles: Record<Job["status"], string> = {
    draft:
      "bg-neutral-100 text-neutral-600 border border-neutral-200",
    published:
      "bg-green-50 text-green-700 border border-green-200",
    closed:
      "bg-neutral-100 text-neutral-500 border border-neutral-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function VendorJobsPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionJobId, setActionJobId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getCurrentIdToken();
      const data = await getMyJobs(token);
      setJobs(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAction(job: Job, status: Job["status"]) {
    setActionError(null);
    setActionJobId(job.id);
    try {
      const token = await getCurrentIdToken();
      await setJobStatus(token, job.id, status);
      await load();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Action failed. Please try again.",
      );
    } finally {
      setActionJobId(null);
    }
  }

  const formatRate = (job: Job) =>
    `${job.rateAmount} / ${RATE_LABELS[job.rateType] ?? job.rateType}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/vendor"
            className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            &larr; Dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">My Jobs</h1>
          <p className="mt-1 text-neutral-500">
            Create, publish and manage your job listings.
          </p>
        </div>
        <Link
          to="/vendor/jobs/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          + Create Job
        </Link>
      </div>

      {actionError && (
        <div className="mb-4">
          <FriendlyAlert icon="error" title="We couldn't do that">
            {actionError}
          </FriendlyAlert>
        </div>
      )}

      {loading && jobs === null ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : error ? (
        <FriendlyAlert icon="error" title="We couldn't load your jobs">
          {error}
        </FriendlyAlert>
      ) : !jobs || jobs.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
          <p className="text-neutral-500 mb-4">
            You haven't created any jobs yet. Create a draft to get started.
          </p>
          <Link
            to="/vendor/jobs/new"
            className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            Create Your First Job
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-neutral-900 break-words">
                      {job.title}
                    </h2>
                    <StatusPill status={job.status} />
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">
                    {CATEGORY_LABELS[job.jobCategory] ?? job.jobCategory} ·{" "}
                    {WORK_TYPE_LABELS[job.workType] ?? job.workType}
                  </p>
                  <p className="mt-2 text-sm font-medium text-neutral-700">
                    {formatRate(job)}
                    <span className="font-normal text-neutral-400"> · {job.spotsAvailable} spot{job.spotsAvailable > 1 ? "s" : ""}</span>
                  </p>
                  {job.location.city && (
                    <p className="mt-1 text-sm text-neutral-500">
                      {[job.location.city, job.location.state, job.location.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {job.status === "draft" && (
                    <>
                      <Link
                        to={`/vendor/jobs/${job.id}/edit`}
                        className="inline-flex items-center rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={actionJobId === job.id}
                        onClick={() => void handleAction(job, "published")}
                        className="inline-flex items-center rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
                      >
                        Publish
                      </button>
                    </>
                  )}
                  {job.status === "published" && (
                    <>
                      <Link
                        to={`/vendor/jobs/${job.id}/applicants`}
                        className="inline-flex items-center rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                      >
                        View Applicants
                      </Link>
                      <button
                        type="button"
                        disabled={actionJobId === job.id}
                        onClick={() => void handleAction(job, "closed")}
                        className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
                      >
                        Close Job
                      </button>
                    </>
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
