import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useVendorProfile } from "../../context/useVendorProfile";
import VendorProfileForm from "../../components/vendor/VendorProfileForm";
import type { VendorProfile } from "../../types";

export default function VendorProfileCreatePage() {
  const { profile, profileLoading, profileError, fetchProfile, saveProfile } =
    useVendorProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile && !profileError) {
      void fetchProfile();
    }
  }, [profile, profileError, fetchProfile]);

  useEffect(() => {
    if (!profileLoading && profile && !profileError) {
      navigate("/vendor/profile", { replace: true });
    }
  }, [profileLoading, profile, profileError, navigate]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  async function handleSave(data: Omit<VendorProfile, "id" | "completeness" | "verification">) {
    await saveProfile(data);
    navigate("/vendor/profile");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link
          to="/vendor"
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          &larr; Dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">
          Create Your Business Profile
        </h1>
        <p className="mt-1 text-neutral-500">
          Tell job seekers about your business so they can find and apply to
          your jobs.
        </p>
      </div>

      <VendorProfileForm
        mode="create"
        initialData={{
          businessInfo: {
            businessName: "",
            businessType: "",
            description: "",
            website: "",
            phone: "",
            contactEmail: "",
          },
          location: {
            city: "",
            state: "",
            country: "",
            address: "",
          },
        }}
        onSubmit={handleSave}
        onCancel={() => navigate("/vendor")}
      />
    </div>
  );
}
