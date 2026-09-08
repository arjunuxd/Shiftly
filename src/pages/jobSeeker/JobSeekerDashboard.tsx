import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useProfile } from "../../context/useProfile";
import { getVerification, discoverJobs, getMyApplications, getConversations } from "../../lib/api";
import { getCurrentIdToken } from "../../lib/auth";
import { VerificationBadge } from "../../components/ui/VerificationBadge";
import JobSeekerNav from "../../components/jobSeeker/JobSeekerNav";
import ProfileCompletionCard from "../../components/profile/ProfileCompletionCard";
import { ShiftReadyCard } from "../../components/profile/ShiftReady";
import ReputationSummaryCard from "../../components/profile/ReputationSummaryCard";
import type { VerificationRecord, PublicJob, Application, Conversation } from "../../types";
import { APPLICATION_STATUS_LABELS } from "../../types";

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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function JobSeekerDashboard() {
  const { currentUser } = useAuth();
  const { profile, profileLoading, fetchProfile } = useProfile();
  const [verification, setVerification] = useState<VerificationRecord | null>(null);
  const [recentJobs, setRecentJobs] = useState<PublicJob[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [dashLoading, setDashLoading] = useState(true);

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

  const fetchDashboardData = useCallback(async () => {
    try {
      const city = profile?.location?.city;
      const state = profile?.location?.state;
      const result = await discoverJobs({
        sortBy: "location",
        ...(city ? { locationCity: city } : {}),
        ...(state ? { locationState: state } : {}),
      });
      setRecentJobs(result.jobs.slice(0, 3));
    } catch {
      // non-blocking
    }

    try {
      const token = await getCurrentIdToken();
      const [apps, convs] = await Promise.all([
        getMyApplications(token),
        getConversations(token).catch(() => []),
      ]);
      setRecentApplications(apps.slice(0, 5));
      setConversations(convs);
    } catch {
      // non-blocking
    }

    setDashLoading(false);
  }, [profile]);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  const verificationStatus = verification?.status ?? "unverified";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <JobSeekerNav />
      <div className="mt-6 border-b border-neutral-200 pb-6 mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent-600 mb-2">
          Welcome back
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 mb-1">
          Home
        </h1>
        <p className="text-neutral-500">
          Manage your profile and track your job search.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          {profile ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {profile.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-full object-cover border border-neutral-200"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
                      {profile.personalInfo.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}
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

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  to="/job-seeker/profile"
                  className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  View Profile
                </Link>
                <Link
                  to="/job-seeker/profile/preview"
                  className="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  Employer Preview
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

        {/* Shift Ready */}
        <ShiftReadyCard
          profile={profile}
          emailVerified={currentUser?.emailVerified ?? false}
        />

        {/* Reputation */}
        <ReputationSummaryCard userId={currentUser?.uid} role="job_seeker" />

        {/* Profile Completion */}
        {profile && profile.completeness < 100 && <ProfileCompletionCard />}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/jobs"
            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary-200 transition-all flex items-center gap-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-50">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-neutral-900">Browse Jobs</p>
              <p className="text-sm text-neutral-500">Find available shifts</p>
            </div>
          </Link>

          <Link
            to="/job-seeker/applications"
            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary-200 transition-all flex items-center gap-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-50">
              <svg className="h-6 w-6 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-neutral-900">My Applications</p>
              <p className="text-sm text-neutral-500">{recentApplications.length} active</p>
            </div>
          </Link>

          <Link
            to="/job-seeker/messages"
            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary-200 transition-all flex items-center gap-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-50">
              <svg className="h-6 w-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 20.105V4.875A1.875 1.875 0 015.625 3h12.75A1.875 1.875 0 0120.25 4.875v10.5A1.875 1.875 0 0118.375 17.25H7.5l-3.75 2.855z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-neutral-900">Messages</p>
              <p className="text-sm text-neutral-500">{conversations.length} conversations</p>
            </div>
          </Link>
        </div>

        {/* Recent Applications */}
        {!dashLoading && recentApplications.length > 0 && (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Applications</h2>
              <Link
                to="/job-seeker/applications"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <Link
                      to={`/jobs/${app.jobId}`}
                      className="font-medium text-neutral-900 hover:text-primary-600 transition-colors truncate"
                    >
                      {app.jobTitle ?? `Job #${app.jobId.slice(0, 8)}`}
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      app.status === "applied"
                        ? "bg-emerald-50 text-emerald-700"
                        : app.status === "under-review"
                          ? "bg-sky-50 text-sky-700"
                          : app.status === "withdrawn" || app.status === "cancelled"
                            ? "bg-neutral-100 text-neutral-500"
                            : app.status === "accepted" || app.status === "hired"
                              ? "bg-accent-50 text-accent-800"
                              : "bg-red-50 text-red-700"
                    }`}>
                      {APPLICATION_STATUS_LABELS[app.status] ?? app.status}
                    </span>
                    {app.appliedAt && (
                      <span className="text-xs text-neutral-400">{formatDate(app.appliedAt)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Latest Jobs */}
        {!dashLoading && recentJobs.length > 0 && (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">
                {profile?.location?.city ? "Near You" : "Latest Opportunities"}
              </h2>
              <Link
                to="/jobs"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{job.title}</p>
                    <p className="text-sm text-neutral-500">
                      {job.location.city}, {job.location.state}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary-600 shrink-0 ml-4">
                    ${job.rateAmount.toLocaleString()}/{job.rateType === "hourly" ? "hr" : "day"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
