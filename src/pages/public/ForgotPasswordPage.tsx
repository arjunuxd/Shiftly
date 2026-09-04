import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { sendPasswordReset } from "../../lib/auth";
import { getAuthErrorMessage } from "../../lib/authErrors";
import FormField, { FormError, SubmitButton } from "../../components/ui/FormField";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldError(undefined);

    if (!email.trim()) {
      setFieldError("Email is required.");
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setFieldError("Please enter a valid email address.");
      return;
    }

    setPending(true);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-neutral-900">Check your email</h1>
          <p className="mt-4 text-neutral-600">
            If an account exists for <span className="font-medium">{email}</span>,
            we sent a password reset link. It may take a few minutes to arrive.
          </p>
          <div className="mt-8">
            <Link
              to="/login"
              className="inline-block rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-neutral-900 text-center">
          Reset your password
        </h1>
        <p className="mt-2 text-center text-neutral-500">
          Enter your email and we&apos;ll send you a link to reset it.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 rounded-xl border border-neutral-200 bg-white p-8 shadow-sm"
        >
          <div className="flex flex-col gap-4">
            {error && <FormError title="We couldn't send a reset link">{error}</FormError>}
            <FormField
              type="email"
              label="Email address"
              autoComplete="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              error={fieldError}
              placeholder="you@example.com"
            />
            <SubmitButton pending={pending}>Send Reset Link</SubmitButton>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
