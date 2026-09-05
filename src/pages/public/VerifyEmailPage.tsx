import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { sendVerificationEmail } from "../../lib/auth";
import { getAuthErrorMessage } from "../../lib/authErrors";
import { getRoleHomePath } from "../../lib/roles";
import { FormError, FriendlyAlert } from "../../components/ui/FormField";

export default function VerifyEmailPage() {
  const { currentUser, emailVerified, refreshUser, resolveRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const autoSent = useRef(false);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login", { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (emailVerified) {
      const run = async () => {
        const resolvedRole = await resolveRole();
        navigate(getRoleHomePath(resolvedRole), { replace: true });
      };
      run();
    }
  }, [emailVerified, navigate, resolveRole]);

  useEffect(() => {
    if (!currentUser || emailVerified || autoSent.current) {
      return;
    }
    autoSent.current = true;
    sendVerificationEmail().catch(() => {
      // User can resend manually below if the automatic attempt fails.
    });
  }, [currentUser, emailVerified]);

  async function handleResend() {
    setResending(true);
    setError(null);
    setResent(false);
    try {
      await sendVerificationEmail();
      setResent(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setResending(false);
    }
  }

  async function handleCheck() {
    setChecking(true);
    setError(null);
    try {
      const freshUser = await refreshUser();
      if (!freshUser?.emailVerified) {
        setError(
          "We still don't show your email as verified. If you just clicked the link, give it a minute, then try again — or resend a fresh link below.",
        );
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setChecking(false);
    }
  }

  if (emailVerified) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-neutral-900">Email verified</h1>
          <p className="mt-4 text-neutral-600">
            Thanks for verifying your email. Redirecting you now...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-neutral-900">
          Verify your email
        </h1>
        <p className="mt-4 text-neutral-600">
          We sent a verification link to{" "}
          <span className="font-medium">{currentUser?.email}</span>. Click the
          link in the email to activate your account.
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          Didn't see it? Check your spam or junk folder — once verified, tap{" "}
          <span className="font-medium">"I've verified my email"</span> and
          we'll confirm it right away.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {error && <FormError title="We couldn't verify your email">{error}</FormError>}
          {resent && (
            <FriendlyAlert icon="success" title="Verification email sent">
              Check your inbox, including spam, and click the link to complete
              verification.
            </FriendlyAlert>
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {resending ? "Sending..." : "Resend verification email"}
          </button>

          <button
            type="button"
            onClick={handleCheck}
            disabled={checking}
            className="rounded-lg border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {checking ? "Checking..." : "I've verified my email"}
          </button>

          <button
            type="button"
            onClick={async () => {
              await signOut();
              navigate("/register", { replace: true });
            }}
            className="text-sm text-neutral-400 hover:text-neutral-600"
          >
            Use a different email
          </button>
        </div>
      </div>
    </div>
  );
}
