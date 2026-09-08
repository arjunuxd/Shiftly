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
import { FriendlyAlert } from "../../components/ui/FormField";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ReasonDialog from "../../components/ui/ReasonDialog";
import DataErrorState from "../../components/ui/DataErrorState";
import { getFriendlyError } from "../../lib/errors";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import StatusPill, { PillDot } from "../../components/admin/StatusPill";
import EmptyState from "../../components/admin/EmptyState";
import TableSkeleton from "../../components/admin/TableSkeleton";

type Tab = "job-seekers" | "vendors";

function VerificationStatus({ status }: { status: string }) {
  const tone =
    status === "approved"
      ? ("green" as const)
      : status === "rejected"
        ? ("red" as const)
        : status === "unverified"
          ? ("neutral" as const)
          : ("amber" as const);
  return (
    <StatusPill tone={tone}>
      <PillDot />
      {status}
    </StatusPill>
  );
}

export default function AdminVerificationsPage() {
  const [tab, setTab] = useState<Tab>("job-seekers");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [jobSeekerVerifications, setJobSeekerVerifications] = useState<AdminVerification[]>([]);
  const [vendorVerifications, setVendorVerifications] = useState<AdminVendorVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<{ kind: "seeker" | "vendor"; id: string; label: string } | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ kind: "seeker" | "vendor"; id: string; label: string } | null>(null);
  const [busy, setBusy] = useState(false);

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
      setError(getFriendlyError(e, "Something went wrong while loading the verifications. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [tab, statusFilter]);

  useEffect(() => {
    loadVerifications();
  }, [loadVerifications]);

  async function confirmApprove() {
    if (!approveTarget) return;
    setBusy(true);
    setActionError(null);
    try {
      const token = await getCurrentIdToken();
      if (approveTarget.kind === "seeker") {
        await adminApproveVerification(token, approveTarget.id);
      } else {
        await adminApproveVendorVerification(token, approveTarget.id);
      }
      setApproveTarget(null);
      await loadVerifications();
    } catch (e) {
      setActionError(getFriendlyError(e, "We couldn't approve this verification. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  async function confirmReject(reason: string) {
    if (!rejectTarget) return;
    setBusy(true);
    setActionError(null);
    try {
      const token = await getCurrentIdToken();
      if (rejectTarget.kind === "seeker") {
        await adminRejectVerification(token, rejectTarget.id, reason);
      } else {
        await adminRejectVendorVerification(token, rejectTarget.id, reason);
      }
      setRejectTarget(null);
      await loadVerifications();
    } catch (e) {
      setActionError(getFriendlyError(e, "We couldn't reject this verification. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  const emptySeekers = !loading && tab === "job-seekers" && jobSeekerVerifications.length === 0;
  const emptyVendors = !loading && tab === "vendors" && vendorVerifications.length === 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Moderation"
        title="Verifications"
        description="Review identity and business verification submissions."
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-neutral-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setTab("job-seekers")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "job-seekers"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            }`}
          >
            Job Seekers
          </button>
          <button
            onClick={() => setTab("vendors")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "vendors"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            }`}
          >
            Vendors
          </button>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
          aria-label="Filter by verification status"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
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
          title="We couldn't load the verifications"
          message={error}
          onRetry={() => void loadVerifications()}
        />
      ) : (
        <>
      {loading ? (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/80">
                {["User ID", "Type", "Status", "Submitted", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <TableSkeleton rows={5} cells={5} />
            </tbody>
          </table>
        </div>
      ) : tab === "job-seekers" ? (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {emptySeekers ? (
            <EmptyState
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="No verifications found"
              hint="There's nothing in this list for the current filter."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/80">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">User ID</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Type</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Submitted</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {jobSeekerVerifications.map((v) => (
                    <tr key={v.id} className="transition-colors hover:bg-primary-50/40">
                      <td className="px-5 py-3.5 font-mono text-xs text-neutral-700">{v.userId.slice(0, 12)}…</td>
                      <td className="px-5 py-3.5 text-neutral-600">{v.type}</td>
                      <td className="px-5 py-3.5"><VerificationStatus status={v.status} /></td>
                      <td className="px-5 py-3.5 text-neutral-500">
                        {v.submittedAt ? new Date(v.submittedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex flex-wrap gap-2 justify-end">
                          {v.status === "pending" && (
                            <>
                              <button
                                onClick={() => setApproveTarget({ kind: "seeker", id: v.userId, label: "this verification" })}
                                className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectTarget({ kind: "seeker", id: v.userId, label: "this verification" })}
                                className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                        {v.rejectionReason && (
                          <p className="mt-1 text-xs text-red-500">{v.rejectionReason}</p>
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
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {emptyVendors ? (
            <EmptyState
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="No vendor verifications found"
              hint="There's nothing in this list for the current filter."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/80">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Business</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Type</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Location</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Submitted</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {vendorVerifications.map((v) => (
                    <tr key={v.id} className="transition-colors hover:bg-primary-50/40">
                      <td className="px-5 py-3.5 font-medium text-neutral-900">{v.businessName}</td>
                      <td className="px-5 py-3.5 text-neutral-600">{v.businessType}</td>
                      <td className="px-5 py-3.5 text-neutral-600">{v.city}, {v.country}</td>
                      <td className="px-5 py-3.5"><VerificationStatus status={v.status} /></td>
                      <td className="px-5 py-3.5 text-neutral-500">
                        {v.submittedAt ? new Date(v.submittedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex flex-wrap gap-2 justify-end">
                          {v.status === "pending" && (
                            <>
                              <button
                                onClick={() => setApproveTarget({ kind: "vendor", id: v.id, label: v.businessName || "this vendor" })}
                                className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectTarget({ kind: "vendor", id: v.id, label: v.businessName || "this vendor" })}
                                className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                        {v.rejectionReason && (
                          <p className="mt-1 text-xs text-red-500">{v.rejectionReason}</p>
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
        </>
      )}

      <ConfirmDialog
        open={approveTarget !== null}
        title="Approve this verification?"
        message={`Approve ${approveTarget?.label ?? "this verification"}? The user's profile details will be marked as verified.`}
        confirmLabel="Approve"
        busy={busy}
        onConfirm={() => void confirmApprove()}
        onCancel={() => setApproveTarget(null)}
      />

      <ReasonDialog
        open={rejectTarget !== null}
        title="Reject this verification?"
        message={`Reject ${rejectTarget?.label ?? "this verification"}? The applicant will see the reason.`}
        confirmLabel="Reject"
        reasonLabel="Rejection reason"
        reasonPlaceholder="e.g. Document doesn't match submitted details"
        reasonRequired
        busy={busy}
        onConfirm={(reason) => void confirmReject(reason)}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
}