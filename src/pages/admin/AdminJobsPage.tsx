import { useCallback, useEffect, useState } from "react";
import { getCurrentIdToken } from "../../lib/auth";
import { adminGetJobs, adminRemoveJob, adminRestoreJob } from "../../lib/api";
import type { AdminJob } from "../../types";
import { FriendlyAlert } from "../../components/ui/FormField";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ReasonDialog from "../../components/ui/ReasonDialog";
import DataErrorState from "../../components/ui/DataErrorState";
import { getFriendlyError } from "../../lib/errors";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import StatusPill, { PillDot } from "../../components/admin/StatusPill";
import EmptyState from "../../components/admin/EmptyState";
import TableSkeleton from "../../components/admin/TableSkeleton";
import PaginationControls from "../../components/admin/PaginationControls";

function formatRate(job: AdminJob) {
  if (job.rateType === "hourly") return `$${job.rateAmount}/hr`;
  if (job.rateType === "daily") return `$${job.rateAmount}/day`;
  return `$${job.rateAmount}`;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [moderationFilter, setModerationFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [removeTarget, setRemoveTarget] = useState<AdminJob | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<AdminJob | null>(null);
  const [busy, setBusy] = useState(false);
  const limit = 20;

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getCurrentIdToken();
      const result = await adminGetJobs(token, {
        status: statusFilter,
        moderationStatus: moderationFilter,
        search,
        limit,
        offset,
      });
      setJobs(result.jobs);
      setTotal(result.total);
    } catch (e) {
      setError(getFriendlyError(e, "Something went wrong while loading the jobs. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, moderationFilter, search, offset]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  async function confirmRemove(reason: string) {
    if (!removeTarget) return;
    setBusy(true);
    setActionError(null);
    try {
      const token = await getCurrentIdToken();
      await adminRemoveJob(token, removeTarget.id, reason);
      setRemoveTarget(null);
      await loadJobs();
    } catch (e) {
      setActionError(getFriendlyError(e, "We couldn't remove this job. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  async function confirmRestore() {
    if (!restoreTarget) return;
    setBusy(true);
    setActionError(null);
    try {
      const token = await getCurrentIdToken();
      await adminRestoreJob(token, restoreTarget.id);
      setRestoreTarget(null);
      await loadJobs();
    } catch (e) {
      setActionError(getFriendlyError(e, "We couldn't restore this job. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Moderation"
        title="Job Management"
        description="Moderate and manage all job postings on the platform."
      />

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
          aria-label="Filter by job status"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={moderationFilter}
          onChange={(e) => { setModerationFilter(e.target.value); setOffset(0); }}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
          aria-label="Filter by moderation status"
        >
          <option value="all">All Moderation</option>
          <option value="normal">Normal</option>
          <option value="flagged">Flagged</option>
          <option value="removed">Removed</option>
        </select>
        <input
          type="text"
          placeholder="Search by title or city..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
          className="min-w-[220px] flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
        />
      </div>

      {actionError && (
        <FriendlyAlert icon="error" title="That action didn't go through">
          {actionError}
        </FriendlyAlert>
      )}

      {error ? (
        <DataErrorState
          title="We couldn't load the jobs"
          message={error}
          onRetry={() => void loadJobs()}
        />
      ) : (
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/80">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Title</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">City</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Moderation</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Rate</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <TableSkeleton rows={6} cells={6} />
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      }
                      title="No jobs found"
                      hint="Try changing the status, moderation, or search filters."
                    />
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="transition-colors hover:bg-primary-50/40">
                    <td className="max-w-[220px] truncate px-5 py-3.5 font-medium text-neutral-900" title={job.title}>
                      {job.title}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600">{job.location.city}</td>
                    <td className="px-5 py-3.5">
                      <StatusPill tone={job.status === "published" ? "green" : job.status === "draft" ? "amber" : "neutral"}>
                        <PillDot />
                        {job.status}
                      </StatusPill>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill tone={job.moderationStatus === "removed" ? "red" : job.moderationStatus === "flagged" ? "orange" : "neutral"}>
                        {job.moderationStatus}
                      </StatusPill>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 font-medium text-neutral-800">{formatRate(job)}</td>
                    <td className="px-5 py-3.5 text-right">
                      {job.moderationStatus === "removed" ? (
                        <button
                          onClick={() => setRestoreTarget(job)}
                          className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => setRemoveTarget(job)}
                          className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <PaginationControls
        offset={offset}
        limit={limit}
        total={total}
        onPrev={() => setOffset(Math.max(0, offset - limit))}
        onNext={() => setOffset(offset + limit)}
      />

      <ReasonDialog
        open={removeTarget !== null}
        title={`Remove "${removeTarget?.title ?? "this job"}"?`}
        message="The job will be hidden from discovery and the vendor will need to fix any issues before republishing."
        confirmLabel="Remove job"
        reasonLabel="Removal reason"
        reasonPlaceholder="e.g. Violates posting guidelines"
        reasonRequired
        busy={busy}
        onConfirm={(reason) => void confirmRemove(reason)}
        onCancel={() => setRemoveTarget(null)}
      />

      <ConfirmDialog
        open={restoreTarget !== null}
        title="Restore this job?"
        message={`This will bring "${restoreTarget?.title ?? "this job"}" back onto the platform.`}
        confirmLabel="Restore"
        busy={busy}
        onConfirm={() => void confirmRestore()}
        onCancel={() => setRestoreTarget(null)}
      />
    </div>
  );
}