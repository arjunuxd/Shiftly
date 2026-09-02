import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useVendorProfile } from "../../context/useVendorProfile";
import VendorProfileDisplay from "../../components/vendor/VendorProfileDisplay";

export default function VendorProfilePage() {
  const { profile, profileLoading, profileError, fetchProfile } =
    useVendorProfile();
  const navigate = useNavigate();

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!profileLoading && !profile && !profileError) {
      navigate("/vendor/profile/create", { replace: true });
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
        <div className="rounded-lg bg-red-50 p-6 text-sm text-red-700 border border-red-200">
          {profileError}
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/vendor"
            className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            &larr; Dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">Your Business Profile</h1>
        </div>
        <Link
          to="/vendor/profile/edit"
          className="inline-flex items-center rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Edit Profile
        </Link>
      </div>

      <VendorProfileDisplay profile={profile} />
    </div>
  );
}
