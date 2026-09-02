import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useVendorProfile } from "../../context/useVendorProfile";
import VendorProfileForm from "../../components/vendor/VendorProfileForm";
import type { VendorProfile } from "../../types";

export default function VendorProfileEditPage() {
  const { profile, profileLoading, profileError, fetchProfile, saveProfile } =
    useVendorProfile();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!profileLoading && !profile && !profileError) {
      navigate("/vendor/profile/create", { replace: true });
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

  const initialData: Omit<VendorProfile, "id" | "completeness" | "verification"> = {
    businessInfo: profile.businessInfo,
    location: profile.location,
  };

  async function handleSave(data: Omit<VendorProfile, "id" | "completeness" | "verification">) {
    await saveProfile(data);
    navigate("/vendor/profile");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link
          to="/vendor/profile"
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          &larr; Back to profile
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">Edit Business Profile</h1>
        <p className="mt-1 text-neutral-500">Update your business information.</p>
      </div>

      <VendorProfileForm
        mode="edit"
        initialData={initialData}
        onSubmit={handleSave}
        onCancel={() => navigate("/vendor/profile")}
      />
    </div>
  );
}
