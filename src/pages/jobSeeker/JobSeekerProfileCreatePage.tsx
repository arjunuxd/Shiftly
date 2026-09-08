import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "../../context/useProfile";
import ProfileForm from "../../components/profile/ProfileForm";
import type { Profile } from "../../types";

const ONBOARDING_STEPS = [
  {
    number: 1,
    title: "Create profile",
    description: "Tell employers who you are",
  },
  {
    number: 2,
    title: "Verify identity",
    description: "Prove you are who you say you are",
  },
  {
    number: 3,
    title: "Start applying",
    description: "Browse and apply to shifts",
  },
] as const;

function OnboardingProgress() {
  return (
    <ol className="grid grid-cols-3 gap-3">
      {ONBOARDING_STEPS.map((step) => (
        <li key={step.number} className="flex items-start gap-2.5">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              step.number === 1
                ? "bg-primary-600 text-white"
                : "bg-neutral-100 text-neutral-400"
            }`}
          >
            {step.number}
          </span>
          <div className="min-w-0">
            <p
              className={`text-sm font-semibold ${
                step.number === 1 ? "text-neutral-900" : "text-neutral-400"
              }`}
            >
              {step.title}
            </p>
            {step.number === 1 && (
              <p className="text-xs text-neutral-400">{step.description}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function JobSeekerProfileCreatePage() {
  const { profile, profileLoading, fetchProfile, saveProfile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!profileLoading && profile) {
      navigate("/job-seeker/profile", { replace: true });
    }
  }, [profileLoading, profile, navigate]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (profile) {
    return null;
  }

  const initialData: Omit<Profile, "id" | "completeness"> = {
    headline: "",
    personalInfo: {
      fullName: "",
      bio: "",
      phone: "",
    },
    skills: [],
    experience: [],
    education: [],
    availability: [
      { day: "Monday", startTime: "09:00", endTime: "17:00" },
      { day: "Tuesday", startTime: "09:00", endTime: "17:00" },
      { day: "Wednesday", startTime: "09:00", endTime: "17:00" },
      { day: "Thursday", startTime: "09:00", endTime: "17:00" },
      { day: "Friday", startTime: "09:00", endTime: "17:00" },
      { day: "Saturday", startTime: "10:00", endTime: "14:00" },
      { day: "Sunday", startTime: "10:00", endTime: "14:00" },
    ],
    workPreferences: { jobCategories: [], workTypes: [] },
    location: { city: "", state: "", country: "", latitude: null, longitude: null },
    photoUrl: null,
    resumeUrl: null,
    resumeName: null,
    certificates: [],
    portfolioLinks: [],
  };

  async function handleCreate(data: Omit<Profile, "id" | "completeness">) {
    await saveProfile(data);
    navigate("/job-seeker/profile", { replace: true });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <Link
          to="/job-seeker"
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          &larr; Home
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">
          Welcome! Let's build your profile.
        </h1>
        <p className="mt-1 text-neutral-500">
          Complete your profile to start finding shifts. You can save and
          finish later.
        </p>
        <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <OnboardingProgress />
        </div>
      </div>

      <ProfileForm
        mode="create"
        initialData={initialData}
        onSubmit={handleCreate}
        onCancel={() => navigate("/job-seeker")}
      />
    </div>
  );
}