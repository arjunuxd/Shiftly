import { useCallback, useEffect, useState } from "react";
import { getCurrentIdToken } from "../../lib/auth";
import {
  adminGetVerifications,
  adminApproveVerification,
  adminRejectVerification,
  adminGetVendorVerifications,
  adminApproveVendorVerification,
  adminRejectVendorVerification,
} from "../../lib/api";
import type { AdminVerification, AdminVendorVerification } from "../../types";

type Tab = "job-seekers" | "vendors";

export default function AdminVerificationsPage() {
  const [tab, setTab] = useState<Tab>("job-seekers");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [jobSeekerVerifications, setJobSeekerVerifications] = useState<AdminVerification[]>([]);
  const [vendorVerifications, setVendorVerifications] = useState<AdminVendorVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVerifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getCurrentIdToken();
      if (tab === "job-seekers") {
        const data = await adminGetVerifications(token, statusFilter);
        setJobSeekerVerifications(data);
      } else {
        const data = await adminGetVendorVerifications(token, statusFilter);
        setVendorVerifications(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load verifications.");
    } finally {
      setLoading(false);
    }
  }, [tab, statusFilter]);

  useEffect(() => {
    loadVerifications();
  }, [loadVerifications]);

  async function handleApproveJobSeeker(userId: string) {
    if (!window.confirm("Approve this verification?")) return;
    try {
      const token = await getCurrentIdToken();
      await adminApproveVerification(token, userId);
      await loadVerifications();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to approve.");
    }
  }

  async function handleRejectJobSeeker(userId: string) {
    const reason = window.prompt("Rejection reason:");
    if (!reason || reason.trim().length === 0) return;
    try {
      const token = await getCurrentIdToken();
      await adminRejectVerification(token, userId, reason.trim());
      await loadVerifications();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to reject.");
    }
  }

  async function handleApproveVendor(uid: string) {
    if (!window.confirm("Approve this vendor verification?")) return;
    try {
      const token = await getCurrentIdToken();
      await adminApproveVendorVerification(token, uid);
      await loadVerifications();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to approve.");
    }
  }

  async function handleRejectVendor(uid: string) {
    const reason = window.prompt("Rejection reason:");
    if (!reason || reason.trim().length === 0) return;
    try {
      const token = await getCurrentIdToken();
      await adminRejectVendorVerification(token, uid, reason.trim());
      await loadVerifications();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to reject.");
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Verifications</h2>

      <div className="flex gap-4 mb-6">
        <div className="flex bg-neutral-100 rounded-lg p-1">
          <button
            onClick={() => setTab("job-seekers")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "job-seekers" ? "bg-white shadow-sm text-neutral-900" : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Job Seekers
          </button>
          <button
            onClick={() => setTab("vendors")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "vendors" ? "bg-white shadow-sm text-neutral-900" : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Vendors
          </button>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      ) : tab === "job-seekers" ? (
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          {jobSeekerVerifications.length === 0 ? (
            <p className="px-4 py-12 text-center text-neutral-400">No verifications found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">User ID</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Submitted</th>
                    <th className="px-4 py-3 text-right font-medium text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {jobSeekerVerifications.map((v) => (
                    <tr key={v.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-neutral-900 font-mono text-xs">{v.userId.slice(0, 12)}...</td>
                      <td className="px-4 py-3 text-neutral-600">{v.type}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={v.status} />
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {v.submittedAt ? new Date(v.submittedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {v.status === "pending" && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleApproveJobSeeker(v.userId)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectJobSeeker(v.userId)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {v.rejectionReason && (
                          <p className="text-xs text-red-500 mt-1">{v.rejectionReason}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          {vendorVerifications.length === 0 ? (
            <p className="px-4 py-12 text-center text-neutral-400">No vendor verifications found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Business</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Location</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Submitted</th>
                    <th className="px-4 py-3 text-right font-medium text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {vendorVerifications.map((v) => (
                    <tr key={v.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-neutral-900 font-medium">{v.businessName}</td>
                      <td className="px-4 py-3 text-neutral-600">{v.businessType}</td>
                      <td className="px-4 py-3 text-neutral-600">{v.city}, {v.country}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={v.status} />
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {v.submittedAt ? new Date(v.submittedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {v.status === "pending" && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleApproveVendor(v.id)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectVendor(v.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {v.rejectionReason && (
                          <p className="text-xs text-red-500 mt-1">{v.rejectionReason}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    unverified: "bg-neutral-100 text-neutral-600",
  };
  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${styles[status] ?? styles.unverified}`}>
      {status}
    </span>
  );
}
