import { useCallback, useEffect, useState } from "react";
import { getCurrentIdToken } from "../../lib/auth";
import { adminGetReports, adminResolveReport, adminDismissReport } from "../../lib/api";
import type { AdminReport } from "../../types";
import { FriendlyAlert } from "../../components/ui/FormField";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataErrorState from "../../components/ui/DataErrorState";
import { getFriendlyError } from "../../lib/errors";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import StatusPill, { PillDot } from "../../components/admin/StatusPill";
import EmptyState from "../../components/admin/EmptyState";
import TableSkeleton from "../../components/admin/TableSkeleton";
import PaginationControls from "../../components/admin/PaginationControls";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("open");
  const [offset, setOffset] = useState(0);
  const [resolveTarget, setResolveTarget] = useState<AdminReport | null>(null);
  const [dismissTarget, setDismissTarget] = useState<AdminReport | null>(null);
  const [busy, setBusy] = useState(false);
  const limit = 20;

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getCurrentIdToken();
      const result = await adminGetReports(token, {
        status: statusFilter,
        limit,
        offset,
      });
      setReports(result.reports);
      setTotal(result.total);
    } catch (e) {
      setError(getFriendlyError(e, "Something went wrong while loading the reports. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, offset]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  async function confirmResolve() {
    if (!resolveTarget) return;
    setBusy(true);
    setActionError(null);
    try {
      const token = await getCurrentIdToken();
      await adminResolveReport(token, resolveTarget.id);
      setResolveTarget(null);
      await loadReports();
    } catch (e) {
      setActionError(getFriendlyError(e, "We couldn't resolve this report. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  async function confirmDismiss() {
    if (!dismissTarget) return;
    setBusy(true);
    setActionError(null);
    try {
      const token = await getCurrentIdToken();
      await adminDismissReport(token, dismissTarget.id);
      setDismissTarget(null);
      await loadReports();
    } catch (e) {
      setActionError(getFriendlyError(e, "We couldn't dismiss this report. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Moderation"
        title="Reports"
        description="Review user and job reports and decide on the right action."
      />

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
          aria-label="Filter by report status"
        >
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
          <option value="all">All</option>
        </select>
      </div>

      {actionError && (
        <FriendlyAlert icon="error" title="That action didn't go through">
          {actionError}
        </FriendlyAlert>
      )}

      {error ? (
        <DataErrorState
          title="We couldn't load the reports"
          message={error}
          onRetry={() => void loadReports()}
        />
      ) : (
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/80">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Reason</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Target</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Description</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Created</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <TableSkeleton rows={6} cells={6} />
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                        </svg>
                      }
                      title="No reports found"
                      hint="There are no reports in this list for the current filter."
                    />
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-primary-50/40">
                    <td className="max-w-[160px] truncate px-5 py-3.5 font-medium text-neutral-900" title={r.reason}>
                      {r.reason}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill tone={r.targetType === "user" ? "blue" : "purple"}>
                        {r.targetType}: {r.targetId.slice(0, 8)}…
                      </StatusPill>
                    </td>
                    <td className="max-w-[200px] truncate px-5 py-3.5 text-neutral-600" title={r.description}>
                      {r.description || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill tone={r.status === "open" ? "amber" : r.status === "resolved" ? "green" : "neutral"}>
                        <PillDot />
                        {r.status}
                      </StatusPill>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {r.status === "open" && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setResolveTarget(r)}
                            className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => setDismissTarget(r)}
                            className="inline-flex items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100"
                          >
                            Dismiss
                          </button>
                        </div>
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

      <ConfirmDialog
        open={resolveTarget !== null}
        title="Mark this report as resolved?"
        message="The reported content will be treated as already handled and this report will be closed."
        confirmLabel="Resolve"
        busy={busy}
        onConfirm={() => void confirmResolve()}
        onCancel={() => setResolveTarget(null)}
      />

      <ConfirmDialog
        open={dismissTarget !== null}
        title="Dismiss this report?"
        message="You'll close this report without taking action. Consider whether the report content still needs review."
        confirmLabel="Dismiss"
        busy={busy}
        onConfirm={() => void confirmDismiss()}
        onCancel={() => setDismissTarget(null)}
      />
    </div>
  );
}