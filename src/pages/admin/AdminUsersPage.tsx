import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCurrentIdToken } from "../../lib/auth";
import {
  adminGetUsers,
  adminSuspendUser,
  adminRestoreUser,
} from "../../lib/api";
import type { AdminUser } from "../../types";
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

function RolePill({ role }: { role: AdminUser["role"] }) {
  const map: Record<AdminUser["role"], "purple" | "indigo" | "blue" | "green"> = {
    superadmin: "purple",
    admin: "indigo",
    vendor: "blue",
    job_seeker: "green",
  };
  const label: Record<AdminUser["role"], string> = {
    superadmin: "Superadmin",
    admin: "Admin",
    vendor: "Vendor",
    job_seeker: "Job Seeker",
  };
  return <StatusPill tone={map[role]}>{label[role]}</StatusPill>;
}

export default function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") ?? "all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "all");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<AdminUser | null>(null);
  const [busy, setBusy] = useState(false);
  const limit = 20;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getCurrentIdToken();
      const result = await adminGetUsers(token, {
        role: roleFilter,
        status: statusFilter,
        search,
        limit,
        offset,
      });
      setUsers(result.users);
      setTotal(result.total);
    } catch (e) {
      setError(getFriendlyError(e, "Something went wrong while loading the users. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, search, offset]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function confirmSuspend(reason: string) {
    if (!suspendTarget) return;
    setBusy(true);
    setActionError(null);
    try {
      const token = await getCurrentIdToken();
      await adminSuspendUser(token, suspendTarget.uid, reason);
      setSuspendTarget(null);
      await loadUsers();
    } catch (e) {
      setActionError(getFriendlyError(e, "We couldn't suspend this user. Please try again."));
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
      await adminRestoreUser(token, restoreTarget.uid);
      setRestoreTarget(null);
      await loadUsers();
    } catch (e) {
      setActionError(getFriendlyError(e, "We couldn't restore this user. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Moderation"
        title="User Management"
        description="Review, filter, and manage every account on the platform."
      />

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setOffset(0);
            setSearchParams(current => {
              const next = new URLSearchParams(current);
              if (e.target.value === "all") next.delete("role");
              else next.set("role", e.target.value);
              return next;
            });
          }}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
          aria-label="Filter by role"
        >
          <option value="all">All Roles</option>
          <option value="job_seeker">Job Seekers</option>
          <option value="vendor">Vendors</option>
          <option value="admin">Admins</option>
          <option value="superadmin">Superadmins</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setOffset(0);
            setSearchParams(current => {
              const next = new URLSearchParams(current);
              if (e.target.value === "all") next.delete("status");
              else next.set("status", e.target.value);
              return next;
            });
          }}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <input
          type="text"
          placeholder="Search by email..."
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
          title="We couldn't load the users"
          message={error}
          onRetry={() => void loadUsers()}
        />
      ) : (
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/80">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Email</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Role</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Created</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <TableSkeleton rows={6} cells={5} />
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                        </svg>
                      }
                      title="No users found"
                      hint="Try changing the role, status, or search filters."
                    />
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.uid} className="transition-colors hover:bg-primary-50/40">
                    <td className="px-5 py-3.5 font-medium text-neutral-900">{u.email}</td>
                    <td className="px-5 py-3.5"><RolePill role={u.role} /></td>
                    <td className="px-5 py-3.5">
                      <StatusPill tone={u.status === "active" ? "green" : "red"}>
                        <PillDot />
                        {u.status}
                      </StatusPill>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {u.role !== "superadmin" && (
                        u.status === "active" ? (
                          <button
                            onClick={() => setSuspendTarget(u)}
                            className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => setRestoreTarget(u)}
                            className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                          >
                            Restore
                          </button>
                        )
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
        open={suspendTarget !== null}
        title={`Suspend ${suspendTarget?.email ?? "this user"}?`}
        message="Suspended users can't post jobs, apply, or message until they're restored."
        confirmLabel="Suspend user"
        reasonLabel="Suspension reason"
        reasonPlaceholder="e.g. Repeated policy violations"
        reasonRequired
        busy={busy}
        onConfirm={(reason) => void confirmSuspend(reason)}
        onCancel={() => setSuspendTarget(null)}
      />

      <ConfirmDialog
        open={restoreTarget !== null}
        title="Restore this user?"
        message={`Restoring ${restoreTarget?.email ?? "this user"} gives them back full platform access.`}
        confirmLabel="Restore"
        busy={busy}
        onConfirm={() => void confirmRestore()}
        onCancel={() => setRestoreTarget(null)}
      />
    </div>
  );
}