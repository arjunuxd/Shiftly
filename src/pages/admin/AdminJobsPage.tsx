import { useCallback, useEffect, useState } from "react";
import { getCurrentIdToken } from "../../lib/auth";
import { adminGetJobs, adminRemoveJob, adminRestoreJob } from "../../lib/api";
import type { AdminJob } from "../../types";
import { FriendlyAlert } from "../../components/ui/FormField";

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
      setError(e instanceof Error ? e.message : "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, moderationFilter, search, offset]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  async function handleRemove(jobId: string) {
    const reason = window.prompt("Reason for removal:");
    if (!reason || reason.trim().length === 0) return;
    try {
      const token = await getCurrentIdToken();
      await adminRemoveJob(token, jobId, reason.trim());
      await loadJobs();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to remove job.");
    }
  }

  async function handleRestore(jobId: string) {
    if (!window.confirm("Are you sure you want to restore this job?")) return;
    try {
      const token = await getCurrentIdToken();
      await adminRestoreJob(token, jobId);
      await loadJobs();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to restore job.");
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Job Management</h2>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
          className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={moderationFilter}
          onChange={(e) => { setModerationFilter(e.target.value); setOffset(0); }}
          className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
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
          className="px-3 py-2 border border-neutral-300 rounded-lg text-sm flex-1 min-w-[200px]"
        />
      </div>

      {actionError && (
        <div className="mb-4">
          <FriendlyAlert icon="error" title="That action didn't go through">
            {actionError}
          </FriendlyAlert>
        </div>
      )}

      {error && (
        <div className="mb-4">
          <FriendlyAlert icon="error" title="We couldn't load the jobs">
            {error}
          </FriendlyAlert>
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Title</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">City</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Moderation</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Rate</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-neutral-400">Loading...</td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-neutral-400">No jobs found.</td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-neutral-900 font-medium max-w-[200px] truncate">{job.title}</td>
                    <td className="px-4 py-3 text-neutral-600">{job.location.city}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        job.status === "published" ? "bg-green-100 text-green-800"
                        : job.status === "draft" ? "bg-yellow-100 text-yellow-800"
                        : "bg-neutral-100 text-neutral-600"
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        job.moderationStatus === "removed" ? "bg-red-100 text-red-800"
                        : job.moderationStatus === "flagged" ? "bg-orange-100 text-orange-800"
                        : "bg-neutral-100 text-neutral-600"
                      }`}>
                        {job.moderationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {job.rateType === "hourly" ? `$${job.rateAmount}/hr`
                        : job.rateType === "daily" ? `$${job.rateAmount}/day`
                        : `$${job.rateAmount}`}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {job.moderationStatus === "removed" ? (
                        <button
                          onClick={() => handleRestore(job.id)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRemove(job.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
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
