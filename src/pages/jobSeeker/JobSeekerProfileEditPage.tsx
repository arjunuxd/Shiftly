import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "../../context/useProfile";
import ProfileForm from "../../components/profile/ProfileForm";
import type { Profile } from "../../types";

export default function JobSeekerProfileEditPage() {
  const { profile, profileLoading, profileError, fetchProfile, saveProfile } =
    useProfile();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!profileLoading && !profile && !profileError) {
      navigate("/job-seeker/profile/create", { replace: true });
    }
    if (profile) {
      setReady(true);
    }
  }, [profileLoading, profile, profileError, navigate]);

  if (profileLoading || !ready || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  const initialData: Omit<Profile, "id" | "completeness"> = {
    personalInfo: profile.personalInfo,
    skills: profile.skills,
    experience: profile.experience,
    education: profile.education,
    availability: profile.availability,
    workPreferences: profile.workPreferences,
    location: profile.location,
  };

  async function handleSave(data: Omit<Profile, "id" | "completeness">) {
    await saveProfile(data);
    navigate("/job-seeker/profile");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link
          to="/job-seeker/profile"
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          &larr; Back to profile
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">Edit Profile</h1>
        <p className="mt-1 text-neutral-500">Update your profile information.</p>
      </div>

      <ProfileForm
        mode="edit"
        initialData={initialData}
        onSubmit={handleSave}
        onCancel={() => navigate("/job-seeker/profile")}
      />
    </div>
  );
}
