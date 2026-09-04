import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "../../context/useProfile";
import type { Profile } from "../../types";
import { FriendlyAlert } from "../../components/ui/FormField";

function formatAvailability(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatPay(amount: number, rateType: string): string {
  const unit =
    rateType === "hourly" ? "/hr" : rateType === "daily" ? "/day" : "";
  return `$${amount.toLocaleString()}${unit}`;
}

function employerLocation(p: Profile): string {
  return [p.location.city, p.location.state].filter(Boolean).join(", ") || "Near you";
}

function EmployerPreview({ p }: { p: Profile }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700 border border-accent-100">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-500 mr-1.5 animate-pulse" />
          Live preview
        </span>
        <span className="inline-flex items-center rounded-full bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-500 border border-neutral-100">
          This is how employers see your profile
        </span>
      </div>

      <div className="mt-6 flex items-start gap-4">
        {p.photoUrl ? (
          <img
            src={p.photoUrl}
            alt={p.personalInfo.fullName}
            className="h-20 w-20 shrink-0 rounded-full object-cover border border-neutral-200"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-2xl font-bold text-neutral-400">
            ?
          </div>
        )}
        <div>
          <p className="text-xl font-bold text-neutral-900">
            {p.personalInfo.fullName || "Unnamed Candidate"}
          </p>
          <p className="text-sm text-neutral-500">
            {[p.location.city, p.location.state, p.location.country]
              .filter(Boolean)
              .join(", ") || "Location not set"}
          </p>
          <p className="mt-1 text-sm text-neutral-400">
            Profile completeness:{" "}
            <span className="font-semibold text-neutral-600">
              {p.completeness}%
            </span>
          </p>
        </div>
      </div>

      {p.personalInfo.bio && (
        <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
          {p.personalInfo.bio}
        </p>
      )}

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
            Skills
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-800">
            {p.skills.length > 0
              ? p.skills.slice(0, 4).map((s) => s.name).join(", ") +
                (p.skills.length > 4 ? ` +${p.skills.length - 4} more` : "")
              : "Not added"}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
            Experience
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-800">
            {p.experience.length > 0
              ? p.experience[0].role +
                (p.experience.length > 1
                  ? ` +${p.experience.length - 1} more`
                  : "")
              : "Not added"}
          </p>
        </div>
        {p.resumeUrl && (
          <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
              Resume
            </p>
            <a
              href={p.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              {p.resumeName ?? "View resume"}
            </a>
          </div>
        )}
        {p.certificates.length > 0 && (
          <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
              Certificates
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-800">
              {p.certificates.length} certificate
              {p.certificates.length === 1 ? "" : "s"}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4">
        <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium mb-3">
          Example match preview
        </p>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900">
              Warehouse Associate
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {employerLocation(p)} &middot;{" "}
              {formatAvailability(new Date(Date.now() + 86400000).toISOString())}
            </p>
          </div>
          <p className="text-sm font-semibold text-primary-600">
            {formatPay(18, "hourly")}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-700">
            Strong match
          </span>
          <span className="text-xs text-neutral-400">
            Based on your skills and location
          </span>
        </div>
      </div>
    </div>
  );
}

export default function JobSeekerProfilePreviewPage() {
  const { profile, profileLoading, profileError, fetchProfile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!profileLoading && !profile && !profileError) {
      navigate("/job-seeker/profile/create", { replace: true });
    }
  }, [profileLoading, profile, profileError, navigate]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <FriendlyAlert icon="error" title="We couldn't load the preview">
          {profileError}
        </FriendlyAlert>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/job-seeker/profile"
            className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            &larr; Your profile
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">
            Employer Preview
          </h1>
          <p className="mt-1 text-neutral-500">
            See exactly what employers see when reviewing your application.
          </p>
        </div>
        <Link
          to="/job-seeker/profile/edit"
          className="inline-flex items-center rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Edit Profile
        </Link>
      </div>

      <EmployerPreview p={profile} />

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        This is a preview only. Employers see your details through the platform
        when you apply for a job.
      </div>
    </div>
  );
}