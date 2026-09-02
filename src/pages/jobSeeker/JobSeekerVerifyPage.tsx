import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useProfile } from "../../context/useProfile";
import {
  getVerification,
  submitVerification as apiSubmitVerification,
} from "../../lib/api";
import { getCurrentIdToken } from "../../lib/auth";
import type { VerificationRecord } from "../../types";

function StatusIcon({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (status === "pending") {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
        <svg className="h-8 w-8 animate-spin text-amber-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
      <svg className="h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  );
}

export default function JobSeekerVerifyPage() {
  const { currentUser } = useAuth();
  const { profile, fetchProfile } = useProfile();
  const [verification, setVerification] = useState<VerificationRecord | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    setLoading(true);

    getCurrentIdToken()
      .then((token) => getVerification(token))
      .then((v) => {
        if (active) setVerification(v);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentUser]);

  async function handleSubmit() {
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      const token = await getCurrentIdToken();
      const result = await apiSubmitVerification(token);
      setVerification(result);
      setSuccess(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to submit verification.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const status = verification?.status ?? "unverified";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link
          to="/job-seeker"
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          &larr; Dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">
          Identity Verification
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm text-center">
          <div className="mb-6 flex justify-center">
            <StatusIcon status={status} />
          </div>

          {status === "approved" && (
            <>
              <h2 className="text-xl font-semibold text-green-700 mb-2">
                You are verified
              </h2>
              <p className="text-neutral-500">
                Your identity has been verified. This badge is visible to
                employers.
              </p>
            </>
          )}

          {status === "pending" && (
            <>
              <h2 className="text-xl font-semibold text-amber-700 mb-2">
                Verification in progress
              </h2>
              <p className="text-neutral-500">
                Your verification is being reviewed. This usually takes 1–2
                business days. We'll notify you once it's complete.
              </p>
            </>
          )}

          {status === "rejected" && (
            <>
              <h2 className="text-xl font-semibold text-red-700 mb-2">
                Verification rejected
              </h2>
              {verification?.rejectionReason && (
                <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                  Reason: {verification.rejectionReason}
                </p>
              )}
              <p className="text-neutral-500 mb-6">
                Your verification could not be approved. Please check your
                information and resubmit.
              </p>
              {error && (
                <p className="mb-4 text-sm text-red-600">{error}</p>
              )}
              {success && (
                <p className="mb-4 text-sm text-green-600">
                  Verification resubmitted successfully.
                </p>
              )}
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Resubmit Verification"}
              </button>
            </>
          )}

          {status === "unverified" && (
            <>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Verify your identity
              </h2>
              <p className="text-neutral-500 mb-6">
                Verification helps employers trust your profile. It's quick and
                helps you get hired faster.
              </p>
              <div className="rounded-lg bg-neutral-50 p-4 mb-6 text-left">
                <p className="text-sm font-medium text-neutral-700 mb-2">
                  What's needed:
                </p>
                <ul className="text-sm text-neutral-500 space-y-1">
                  <li>• A valid government-issued photo ID</li>
                  <li>• Your name must match your profile</li>
                  <li>• The document must not be expired</li>
                </ul>
              </div>
              {error && (
                <p className="mb-4 text-sm text-red-600">{error}</p>
              )}
              {success && (
                <p className="mb-4 text-sm text-green-600">
                  Verification submitted! You'll be notified once it's reviewed.
                </p>
              )}
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting || !profile}
                className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit for Verification"}
              </button>
              {!profile && (
                <p className="mt-3 text-xs text-neutral-400">
                  Please complete your profile before submitting for verification.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
