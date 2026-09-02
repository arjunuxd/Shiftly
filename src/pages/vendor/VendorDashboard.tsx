import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useVendorProfile } from "../../context/useVendorProfile";
import { VerificationBadge } from "../../components/vendor/VendorProfileDisplay";
import { getMyJobs, getVendorVerification } from "../../lib/api";
import { getCurrentIdToken } from "../../lib/auth";
import type { Job } from "../../types";

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

export default function VendorDashboard() {
  const { currentUser } = useAuth();
  const {
    profile,
    profileLoading,
    fetchProfile,
  } = useVendorProfile();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const loadStats = useCallback(async () => {
    try {
      const token = await getCurrentIdToken();
      const [jobList, ver] = await Promise.all([
        getMyJobs(token).catch(() => []),
        getVendorVerification(token).catch(() => null),
      ]);
      setJobs(jobList);
      setVerificationStatus(ver?.status ?? undefined);
    } catch {
      // Non-blocking.
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  const status = profile?.verification.status ?? verificationStatus ?? "unverified";
  const publishedCount = jobs.filter((j) => j.status === "published").length;
  const draftCount = jobs.filter((j) => j.status === "draft").length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">
        Vendor Dashboard
      </h1>
      <p className="text-neutral-500 mb-8">
        Manage your business profile and job listings.
      </p>

      <div className="flex flex-col gap-6">
        {/* Profile Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          {profile ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
                    {profile.businessInfo.businessName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {profile.businessInfo.businessName}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {currentUser?.email}
                    </p>
                  </div>
                </div>
                <VerificationBadge status={status} />
              </div>

              <CompletenessBar value={profile.completeness} />

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  to="/vendor/profile"
                  className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  View Profile
                </Link>
                <Link
                  to="/vendor/profile/edit"
                  className="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  Edit Profile
                </Link>
                {status !== "approved" && (
                  <Link
                    to="/vendor/verify"
                    className="inline-flex items-center justify-center rounded-lg border border-primary-200 bg-primary-50 px-5 py-2.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
                  >
                    {status === "rejected"
                      ? "Resubmit Verification"
                      : status === "pending"
                        ? "View Verification"
                        : "Verify Business"}
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-500 mb-4">
                You haven't created your business profile yet. Complete your
                profile to start posting jobs.
              </p>
              <Link
                to="/vendor/profile/create"
                className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Create Business Profile
              </Link>
            </div>
          )}
        </div>

        {/* Jobs Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Job Listings</h2>
            <Link
              to="/vendor/jobs"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Manage jobs &rarr;
            </Link>
          </div>

          {profile ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-neutral-50 p-4 text-center">
                <p className="text-2xl font-bold text-neutral-900">{jobs.length}</p>
                <p className="text-sm text-neutral-500">Total jobs</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{publishedCount}</p>
                <p className="text-sm text-green-600">Published</p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-4 text-center">
                <p className="text-2xl font-bold text-neutral-900">{draftCount}</p>
                <p className="text-sm text-neutral-500">Drafts</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-400">
              Create your business profile to start posting jobs.
            </p>
          )}

          <div className="mt-4">
            <Link
              to="/vendor/jobs/new"
              className="inline-flex items-center rounded-lg border border-dashed border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
            >
              + Create a new job
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
