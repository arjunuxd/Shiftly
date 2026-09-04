import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useVendorProfile } from "../../context/useVendorProfile";
import { FriendlyAlert } from "../../components/ui/FormField";

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
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
      <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    </div>
  );
}

export default function VendorVerifyPage() {
  const {
    profile,
    verification,
    profileLoading,
    fetchProfile,
    submitVerification,
  } = useVendorProfile();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    void fetchProfile().finally(() => setLoading(false));
  }, [fetchProfile]);

  async function handleSubmit() {
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      await submitVerification();
      void fetchProfile();
      setSuccess(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to submit verification.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const status = profile?.verification.status ?? verification?.status ?? "unverified";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link
          to="/vendor"
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          &larr; Dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">
          Business Verification
        </h1>
      </div>

      {loading || profileLoading ? (
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
                Your business is verified
              </h2>
              <p className="text-neutral-500">
                Your business is verified. This badge increases trust with job
                seekers and helps you attract applicants.
              </p>
            </>
          )}

          {status === "pending" && (
            <>
              <h2 className="text-xl font-semibold text-amber-700 mb-2">
                Verification in progress
              </h2>
              <p className="text-neutral-500">
                Your business verification is being reviewed. This usually takes
                1–2 business days. We'll notify you once it's complete.
              </p>
            </>
          )}

          {status === "rejected" && (
            <>
              <h2 className="text-xl font-semibold text-red-700 mb-2">
                Verification rejected
              </h2>
              {profile?.verification.rejectionReason && (
                <div className="mb-4">
                  <FriendlyAlert icon="error" title="Why it was rejected">
                    {profile.verification.rejectionReason}
                  </FriendlyAlert>
                </div>
              )}
              <p className="text-neutral-500 mb-6">
                Your business verification could not be approved. Please check
                your information and resubmit.
              </p>
              {error && (
                <div className="mb-4">
                  <FriendlyAlert icon="error" title="We couldn't resubmit">
                    {error}
                  </FriendlyAlert>
                </div>
              )}
              {success && (
                <div className="mb-4">
                  <FriendlyAlert icon="success" title="Resubmitted">
                    Your verification has been resubmitted for review.
                  </FriendlyAlert>
                </div>
              )}
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting || !profile}
                className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Resubmit Verification"}
              </button>
            </>
          )}

          {status === "unverified" && (
            <>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Verify your business
              </h2>
              <p className="text-neutral-500 mb-6">
                Business verification helps job seekers trust your listings and
                increases application quality.
              </p>
              <div className="rounded-lg bg-neutral-50 p-4 mb-6 text-left">
                <p className="text-sm font-medium text-neutral-700 mb-2">
                  What's needed:
                </p>
                <ul className="text-sm text-neutral-500 space-y-1">
                  <li>• A complete business profile</li>
                  <li>• Valid business registration details</li>
                  <li>• A verifiable contact email or phone</li>
                </ul>
              </div>
              {error && (
                <div className="mb-4">
                  <FriendlyAlert icon="error" title="We couldn't submit">
                    {error}
                  </FriendlyAlert>
                </div>
              )}
              {success && (
                <div className="mb-4">
                  <FriendlyAlert icon="success" title="Submitted">
                    You'll be notified once your verification is reviewed.
                  </FriendlyAlert>
                </div>
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
                  Please create your business profile before submitting for
                  verification.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
