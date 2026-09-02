import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  reloadUser,
  sendVerificationEmail,
} from "../../lib/auth";
import { getAuthErrorMessage } from "../../lib/authErrors";
import { getRoleHomePath } from "../../lib/roles";
import { FormError } from "../../components/ui/FormField";

export default function VerifyEmailPage() {
  const { currentUser, emailVerified, resolveRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

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
      await reloadUser();
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

        <div className="mt-8 flex flex-col gap-3">
          {error && <FormError>{error}</FormError>}
          {resent && (
            <p role="status" className="text-sm text-accent-600">
              Verification email sent.
            </p>
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
