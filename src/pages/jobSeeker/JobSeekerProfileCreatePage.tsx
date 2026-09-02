import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "../../context/useProfile";
import ProfileForm from "../../components/profile/ProfileForm";
import type { Profile } from "../../types";

export default function JobSeekerProfileCreatePage() {
  const { profile, profileLoading, fetchProfile, saveProfile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!profileLoading && profile) {
      navigate("/job-seeker/profile/edit", { replace: true });
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
  };

  async function handleCreate(data: Omit<Profile, "id" | "completeness">) {
    await saveProfile(data);
    navigate("/job-seeker/profile");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link
          to="/job-seeker"
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          &larr; Dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">Create Your Profile</h1>
        <p className="mt-1 text-neutral-500">
          Tell employers about yourself to start finding shifts.
        </p>
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
