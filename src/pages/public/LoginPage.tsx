import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { loginWithEmail } from "../../lib/auth";
import { getAuthErrorMessage } from "../../lib/authErrors";
import { getRoleHomePath } from "../../lib/roles";
import FormField, { FormError, SubmitButton } from "../../components/ui/FormField";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { resolveRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [pending, setPending] = useState(false);

  const from =
    (location.state as { from?: string } | null)?.from ?? "/";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const nextFieldErrors: typeof fieldErrors = {};
    if (!email.trim()) {
      nextFieldErrors.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextFieldErrors.email = "Please enter a valid email address.";
    }
    if (!password) {
      nextFieldErrors.password = "Password is required.";
    }
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setPending(true);
    try {
      await loginWithEmail(email.trim(), password);
      const role = await resolveRole();
      navigate(getRoleHomePath(role), { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-neutral-900 text-center">
          Welcome Back
        </h1>
        <p className="mt-2 text-center text-neutral-500">
          Sign in to your Shiftly account.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 rounded-xl border border-neutral-200 bg-white p-8 shadow-sm"
        >
          <div className="flex flex-col gap-4">
            {error && <FormError>{error}</FormError>}

            <FormField
              type="email"
              label="Email address"
              autoComplete="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              error={fieldErrors.email}
              placeholder="you@example.com"
            />

            <FormField
              type="password"
              label="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              error={fieldErrors.password}
              placeholder="Your password"
            />

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Forgot password?
              </Link>
            </div>

            <SubmitButton pending={pending}>Sign In</SubmitButton>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            Get Started
          </Link>
        </p>

        {from !== "/" && (
          <p className="mt-3 text-center text-xs text-neutral-400">
            You&apos;ll be returned to your requested page after signing in.
          </p>
        )}
      </div>
    </div>
  );
}
