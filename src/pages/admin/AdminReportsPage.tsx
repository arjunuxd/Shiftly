import { useCallback, useEffect, useState } from "react";
import { getCurrentIdToken } from "../../lib/auth";
import { adminGetReports, adminResolveReport, adminDismissReport } from "../../lib/api";
import type { AdminReport } from "../../types";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("open");
  const [offset, setOffset] = useState(0);
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
      setError(e instanceof Error ? e.message : "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, offset]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  async function handleResolve(reportId: string) {
    if (!window.confirm("Mark this report as resolved?")) return;
    try {
      const token = await getCurrentIdToken();
      await adminResolveReport(token, reportId);
      await loadReports();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to resolve report.");
    }
  }

  async function handleDismiss(reportId: string) {
    if (!window.confirm("Dismiss this report?")) return;
    try {
      const token = await getCurrentIdToken();
      await adminDismissReport(token, reportId);
      await loadReports();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to dismiss report.");
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Reports</h2>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
          className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
        >
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
          <option value="all">All</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Reason</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Target</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Description</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Created</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-neutral-400">Loading...</td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-neutral-400">No reports found.</td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-neutral-900 font-medium max-w-[160px] truncate">{r.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        r.targetType === "user" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                      }`}>
                        {r.targetType}: {r.targetId.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600 max-w-[200px] truncate">{r.description || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        r.status === "open" ? "bg-yellow-100 text-yellow-800"
                        : r.status === "resolved" ? "bg-green-100 text-green-800"
                        : "bg-neutral-100 text-neutral-600"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === "open" && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleResolve(r.id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleDismiss(r.id)}
                            className="text-neutral-500 hover:text-neutral-700 text-sm font-medium"
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-neutral-500">
            Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
              className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg disabled:opacity-40 hover:bg-neutral-50"
            >
              Previous
            </button>
            <button
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
              className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg disabled:opacity-40 hover:bg-neutral-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
