import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerWithEmail } from "../../lib/auth";
import { getAuthErrorMessage } from "../../lib/authErrors";
import { assignRole } from "../../lib/api";
import { getCurrentIdToken } from "../../lib/auth";
import type { UserRole } from "../../types";
import FormField, { FormError, SubmitButton } from "../../components/ui/FormField";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const ROLE_OPTIONS: {
  value: Exclude<UserRole, "superadmin">;
  title: string;
  description: string;
}[] = [
  {
    value: "job_seeker",
    title: "I'm looking for work",
    description: "Find part-time, temporary, and shift-based opportunities near you.",
  },
  {
    value: "vendor",
    title: "I'm hiring workers",
    description: "Post jobs and hire verified workers quickly.",
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Exclude<UserRole, "superadmin"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  }>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const nextFieldErrors: typeof fieldErrors = {};
    if (!name.trim()) {
      nextFieldErrors.name = "Name is required.";
    }
    if (!email.trim()) {
      nextFieldErrors.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextFieldErrors.email = "Please enter a valid email address.";
    }
    if (!password) {
      nextFieldErrors.password = "Password is required.";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      nextFieldErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (!role) {
      nextFieldErrors.role = "Please choose an account type.";
    }
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setPending(true);
    try {
      await registerWithEmail(email.trim(), password);
      const token = await getCurrentIdToken();
      await assignRole(token, role as UserRole);

      navigate("/verify-email", { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-neutral-900 text-center">
          Create Your Account
        </h1>
        <p className="mt-2 text-center text-neutral-500">
          Join Shiftly and find your next shift.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 rounded-xl border border-neutral-200 bg-white p-8 shadow-sm"
        >
          <div className="flex flex-col gap-4">
            {error && <FormError title="We couldn't create your account">{error}</FormError>}

            <FormField
              type="text"
              label="Full name"
              autoComplete="name"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              error={fieldErrors.name}
              placeholder="Your full name"
            />

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
              autoComplete="new-password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              error={fieldErrors.password}
              hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
              placeholder="Create a password"
            />

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-neutral-700">
                What type of account?
              </span>
              <div className="flex flex-col gap-3" role="radiogroup" aria-label="Account type">
                {ROLE_OPTIONS.map((option) => {
                  const selected = role === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-4 transition-colors focus-within:ring-2 focus-within:ring-primary-400 focus-within:ring-offset-1 ${
                        selected
                          ? "border-primary-600 bg-primary-50"
                          : "border-neutral-300 hover:border-neutral-400"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="accountType"
                          value={option.value}
                          checked={selected}
                          onChange={() => setRole(option.value)}
                          className="h-4 w-4 accent-primary-600"
                        />
                        <span className="text-sm font-semibold text-neutral-900">
                          {option.title}
                        </span>
                      </span>
                      <span className="pl-7 text-sm text-neutral-500">
                        {option.description}
                      </span>
                    </label>
                  );
                })}
              </div>
              {fieldErrors.role && (
                <p role="alert" className="text-xs text-red-600">
                  {fieldErrors.role}
                </p>
              )}
            </div>

            {!role && (
              <p className="text-xs text-neutral-400">
                Everyday accounts are free. Superadmin accounts are provisioned
                only by Shiftly administrators.
              </p>
            )}

            <SubmitButton pending={pending}>Create Account</SubmitButton>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
