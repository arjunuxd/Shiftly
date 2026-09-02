import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useProfile } from "../../context/useProfile";
import { getVerification } from "../../lib/api";
import { getCurrentIdToken } from "../../lib/auth";
import type { VerificationRecord } from "../../types";
import { useState } from "react";

function CompletenessBar({ value }: { value: number }) {
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-neutral-700">Profile completeness</span>
        <span className="text-neutral-500">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function VerificationBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 border border-green-200">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Verified
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 border border-amber-200">
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Verification pending
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 border border-red-200">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Verification rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-500">
      Not verified
    </span>
  );
}

export default function JobSeekerDashboard() {
  const { currentUser } = useAuth();
  const { profile, profileLoading, fetchProfile } = useProfile();
  const [verification, setVerification] = useState<VerificationRecord | null>(null);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    getCurrentIdToken()
      .then((token) => getVerification(token))
      .then((v) => {
        if (active) setVerification(v);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [currentUser]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  const verificationStatus = verification?.status ?? "unverified";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">
        Job Seeker Dashboard
      </h1>
      <p className="text-neutral-500 mb-8">
        Manage your profile and track your job search.
      </p>

      <div className="flex flex-col gap-6">
        {/* Profile Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          {profile ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
                    {profile.personalInfo.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {profile.personalInfo.fullName}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {currentUser?.email}
                    </p>
                  </div>
                </div>
                <VerificationBadge status={verificationStatus} />
              </div>

              <CompletenessBar value={profile.completeness} />

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/job-seeker/profile"
                  className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  View Profile
                </Link>
                <Link
                  to="/job-seeker/profile/edit"
                  className="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  Edit Profile
                </Link>
                {verificationStatus !== "approved" && (
                  <Link
                    to="/job-seeker/verify"
                    className="inline-flex items-center justify-center rounded-lg border border-primary-200 bg-primary-50 px-5 py-2.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
                  >
                    {verificationStatus === "rejected"
                      ? "Resubmit Verification"
                      : verificationStatus === "pending"
                        ? "View Verification"
                        : "Verify Identity"}
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-500 mb-4">
                You haven't created your profile yet. Complete your profile to
                start finding shifts.
              </p>
              <Link
                to="/job-seeker/profile/create"
                className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Create Your Profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
