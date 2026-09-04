import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { reloadUser, sendVerificationEmail } from "../lib/auth";
import { getAuthErrorMessage } from "../lib/authErrors";
import { FriendlyAlert } from "./ui/FormField";

export default function EmailVerificationPopup() {
  const { currentUser, emailVerified } = useAuth();
  const location = useLocation();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const show =
    !dismissed &&
    currentUser !== null &&
    !emailVerified &&
    location.pathname !== "/verify-email";

  if (!show) return null;

  async function handleResend() {
    setSending(true);
    setError(null);
    setSent(false);
    try {
      await sendVerificationEmail();
      setSent(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  async function handleCheck() {
    setChecking(true);
    setError(null);
    try {
      await reloadUser();
      setDismissed(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setChecking(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Email verification required"
      className="fixed bottom-4 right-4 z-[60] w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-primary-200 bg-white p-5 shadow-lg animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </span>
          <h2 className="text-sm font-bold text-neutral-900">Verify your email</h2>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
        We sent a verification link to{" "}
        <span className="font-medium text-neutral-700">{currentUser?.email}</span>.
        Please check your inbox and click the link to activate your account.
      </p>

      {error && (
        <div className="mt-3">
          <FriendlyAlert icon="error" title="We couldn't send that">
            {error}
          </FriendlyAlert>
        </div>
      )}
      {sent && (
        <div className="mt-3">
          <FriendlyAlert icon="success" title="Resent">
            Check your inbox, including spam.
          </FriendlyAlert>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => void handleCheck()}
          disabled={checking}
          className="flex-1 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition-colors disabled:opacity-60"
        >
          {checking ? "Checking..." : "I've verified it"}
        </button>
        <button
          type="button"
          onClick={() => void handleResend()}
          disabled={sending}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-60"
        >
          {sending ? "Sending..." : "Resend link"}
        </button>
      </div>
    </div>
  );
}