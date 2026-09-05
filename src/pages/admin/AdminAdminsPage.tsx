import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { getCurrentIdToken } from "../../lib/auth";
import { getFriendlyError } from "../../lib/errors";
import {
  adminCreateAdmin,
  adminGetUsers,
  adminSuspendUser,
  adminRestoreUser,
} from "../../lib/api";
import type { AdminUser } from "../../types";
import FormField, { FriendlyAlert, SubmitButton } from "../../components/ui/FormField";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ReasonDialog from "../../components/ui/ReasonDialog";
import DataErrorState from "../../components/ui/DataErrorState";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import StatusPill, { PillDot } from "../../components/admin/StatusPill";
import EmptyState from "../../components/admin/EmptyState";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [creating, setCreating] = useState(false);

  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<AdminUser | null>(null);
  const [busy, setBusy] = useState(false);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getCurrentIdToken();
      const result = await adminGetUsers(token, { role: "admin", limit: 200 });
      setAdmins(result.users);
    } catch (e) {
      setError(getFriendlyError(e, "Something went wrong while loading the admins. Please try again."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    const nextErrors: typeof fieldErrors = {};
    if (!name.trim()) nextErrors.name = "Name is required.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(email.trim())) nextErrors.email = "Enter a valid email address.";
    if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setCreating(true);
    setActionError(null);
    setCreated(false);
    try {
      const token = await getCurrentIdToken();
      await adminCreateAdmin(token, {
        email: email.trim(),
        password,
        displayName: name.trim(),
      });
      setCreated(true);
      setName("");
      setEmail("");
      setPassword("");
      await loadAdmins();
    } catch (e) {
      setActionError(getFriendlyError(e, "We couldn't create this admin. Please try again."));
    } finally {
      setCreating(false);
    }
  }

  async function confirmSuspend(reason: string) {
    if (!suspendTarget) return;
    setBusy(true);
    setActionError(null);
    try {
      const token = await getCurrentIdToken();
      await adminSuspendUser(token, suspendTarget.uid, reason);
      setSuspendTarget(null);
      await loadAdmins();
    } catch (e) {
      setActionError(getFriendlyError(e, "We couldn't suspend this admin. Please try again."));
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
      await loadAdmins();
    } catch (e) {
      setActionError(getFriendlyError(e, "We couldn't restore this admin. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="System"
        title="Admin Accounts"
        description="Create and manage administrators. Admins can moderate users, jobs, verifications, and reports — only superadmins can manage them."
      />

      {actionError && (
        <FriendlyAlert icon="error" title="That action didn't go through">
          {actionError}
        </FriendlyAlert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <form
          onSubmit={handleCreate}
          noValidate
          className="self-start rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-4"
        >
          <div>
            <h3 className="text-base font-bold tracking-tight text-neutral-900">
              Create an admin
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-neutral-500">
              The new admin gets a verified account with the admin role.
            </p>
          </div>

          {created && (
            <FriendlyAlert icon="success" title="Admin created">
              The admin can now sign in at /login and access the admin panel.
            </FriendlyAlert>
          )}

          <FormField
            type="text"
            label="Full name"
            autoComplete="off"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            error={fieldErrors.name}
            placeholder="e.g. Sarah Johnson"
          />
          <FormField
            type="email"
            label="Email address"
            autoComplete="off"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            error={fieldErrors.email}
            placeholder="admin@company.com"
          />
          <FormField
            type="password"
            label="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            error={fieldErrors.password}
            hint="At least 8 characters."
            placeholder="Set a sign-in password"
          />
          <SubmitButton pending={creating}>Create admin</SubmitButton>
        </form>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50/80 px-5 py-4">
            <div>
              <h3 className="text-base font-bold tracking-tight text-neutral-900">Current admins</h3>
              <p className="text-xs text-neutral-500">Administrator accounts on the platform.</p>
            </div>
            <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-primary-600 px-2 text-sm font-bold text-white">
              {admins.length}
            </span>
          </div>

          {error ? (
            <DataErrorState
              title="We couldn't load the admins"
              message={error}
              onRetry={() => void loadAdmins()}
            />
          ) : loading ? (
            <div className="divide-y divide-neutral-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="space-y-2">
                    <div className="h-4 w-48 animate-pulse rounded bg-neutral-200/70" />
                    <div className="h-3 w-24 animate-pulse rounded bg-neutral-200/70" />
                  </div>
                  <div className="h-8 w-20 animate-pulse rounded bg-neutral-200/70" />
                </div>
              ))}
            </div>
          ) : admins.length === 0 ? (
            <EmptyState
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              }
              title="No admins yet"
              hint="Create your first admin using the form on the left."
            />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {admins.map((a) => (
                <li key={a.uid} className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-primary-50/40">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                      {a.email.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-900">{a.email}</p>
                      <p className="text-xs text-neutral-500">
                        {a.createdAt ? `Added ${new Date(a.createdAt).toLocaleDateString()}` : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusPill tone={a.status === "active" ? "green" : "red"}>
                      <PillDot />
                      {a.status}
                    </StatusPill>
                    {a.status === "active" ? (
                      <button
                        type="button"
                        onClick={() => setSuspendTarget(a)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setRestoreTarget(a)}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ReasonDialog
        open={suspendTarget !== null}
        title={`Suspend ${suspendTarget?.email ?? "this admin"}?`}
        message="Suspended admins can't access the admin panel until restored."
        confirmLabel="Suspend admin"
        reasonLabel="Suspension reason"
        reasonPlaceholder="e.g. Temporary access revocation"
        reasonRequired
        busy={busy}
        onConfirm={(reason) => void confirmSuspend(reason)}
        onCancel={() => setSuspendTarget(null)}
      />

      <ConfirmDialog
        open={restoreTarget !== null}
        title="Restore this admin?"
        message={`Restoring ${restoreTarget?.email ?? "this admin"} grants admin access again.`}
        confirmLabel="Restore"
        busy={busy}
        onConfirm={() => void confirmRestore()}
        onCancel={() => setRestoreTarget(null)}
      />
    </div>
  );
}