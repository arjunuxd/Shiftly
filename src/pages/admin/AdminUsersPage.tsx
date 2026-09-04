import { useCallback, useEffect, useState } from "react";
import { getCurrentIdToken } from "../../lib/auth";
import {
  adminGetUsers,
  adminSuspendUser,
  adminRestoreUser,
} from "../../lib/api";
import type { AdminUser } from "../../types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
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
      setError(e instanceof Error ? e.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, search, offset]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleSuspend(uid: string) {
    const reason = window.prompt("Reason for suspension:");
    if (!reason || reason.trim().length === 0) return;
    try {
      const token = await getCurrentIdToken();
      await adminSuspendUser(token, uid, reason.trim());
      await loadUsers();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to suspend user.");
    }
  }

  async function handleRestore(uid: string) {
    if (!window.confirm("Are you sure you want to restore this user?")) return;
    try {
      const token = await getCurrentIdToken();
      await adminRestoreUser(token, uid);
      await loadUsers();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to restore user.");
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">User Management</h2>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setOffset(0); }}
          className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
        >
          <option value="all">All Roles</option>
          <option value="job_seeker">Job Seekers</option>
          <option value="vendor">Vendors</option>
          <option value="superadmin">Superadmins</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
          className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
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
          className="px-3 py-2 border border-neutral-300 rounded-lg text-sm flex-1 min-w-[200px]"
        />
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
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Role</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Created</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-neutral-400">Loading...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-neutral-400">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.uid} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-neutral-900 font-medium">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === "superadmin" ? "bg-purple-100 text-purple-800"
                        : u.role === "vendor" ? "bg-blue-100 text-blue-800"
                        : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        u.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== "superadmin" && (
                        u.status === "active" ? (
                          <button
                            onClick={() => handleSuspend(u.uid)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(u.uid)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
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
