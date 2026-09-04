import type { ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/public/HomePage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import ForgotPasswordPage from "../pages/public/ForgotPasswordPage";
import VerifyEmailPage from "../pages/public/VerifyEmailPage";
import JobSeekerDashboard from "../pages/jobSeeker/JobSeekerDashboard";
import JobSeekerProfilePage from "../pages/jobSeeker/JobSeekerProfilePage";
import JobSeekerProfileEditPage from "../pages/jobSeeker/JobSeekerProfileEditPage";
import JobSeekerProfileCreatePage from "../pages/jobSeeker/JobSeekerProfileCreatePage";
import JobSeekerVerifyPage from "../pages/jobSeeker/JobSeekerVerifyPage";
import JobDiscoveryPage from "../pages/jobSeeker/JobDiscoveryPage";
import JobDetailPage from "../pages/jobSeeker/JobDetailPage";
import ApplicationsPage from "../pages/jobSeeker/ApplicationsPage";
import VendorDashboard from "../pages/vendor/VendorDashboard";
import VendorProfilePage from "../pages/vendor/VendorProfilePage";
import VendorProfileCreatePage from "../pages/vendor/VendorProfileCreatePage";
import VendorProfileEditPage from "../pages/vendor/VendorProfileEditPage";
import VendorVerifyPage from "../pages/vendor/VendorVerifyPage";
import VendorJobsPage from "../pages/vendor/VendorJobsPage";
import VendorJobCreatePage from "../pages/vendor/VendorJobCreatePage";
import VendorJobEditPage from "../pages/vendor/VendorJobEditPage";
import SuperadminDashboard from "../pages/admin/SuperadminDashboard";
import NotFoundPage from "../pages/NotFoundPage";
import { RoleRoute } from "../components/guards/RouteGuards";
import { ProfileProvider } from "../context/ProfileContext";
import { VendorProfileProvider } from "../context/VendorProfileContext";

function JobSeekerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleRoute role="job_seeker">
      <ProfileProvider>{children}</ProfileProvider>
    </RoleRoute>
  );
}

function VendorLayout({ children }: { children: ReactNode }) {
  return (
    <RoleRoute role="vendor">
      <VendorProfileProvider>{children}</VendorProfileProvider>
    </RoleRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "verify-email", element: <VerifyEmailPage /> },
      { path: "jobs", element: <JobDiscoveryPage /> },
      { path: "jobs/:jobId", element: <JobDetailPage /> },
      {
        path: "job-seeker",
        element: <JobSeekerLayout><JobSeekerDashboard /></JobSeekerLayout>,
      },
      {
        path: "job-seeker/profile",
        element: <JobSeekerLayout><JobSeekerProfilePage /></JobSeekerLayout>,
      },
      {
        path: "job-seeker/profile/create",
        element: <JobSeekerLayout><JobSeekerProfileCreatePage /></JobSeekerLayout>,
      },
      {
        path: "job-seeker/profile/edit",
        element: <JobSeekerLayout><JobSeekerProfileEditPage /></JobSeekerLayout>,
      },
      {
        path: "job-seeker/verify",
        element: <JobSeekerLayout><JobSeekerVerifyPage /></JobSeekerLayout>,
      },
      {
        path: "job-seeker/applications",
        element: <JobSeekerLayout><ApplicationsPage /></JobSeekerLayout>,
      },
      {
        path: "vendor",
        element: <VendorLayout><VendorDashboard /></VendorLayout>,
      },
      {
        path: "vendor/profile",
        element: <VendorLayout><VendorProfilePage /></VendorLayout>,
      },
      {
        path: "vendor/profile/create",
        element: <VendorLayout><VendorProfileCreatePage /></VendorLayout>,
      },
      {
        path: "vendor/profile/edit",
        element: <VendorLayout><VendorProfileEditPage /></VendorLayout>,
      },
      {
        path: "vendor/verify",
        element: <VendorLayout><VendorVerifyPage /></VendorLayout>,
      },
      {
        path: "vendor/jobs",
        element: <VendorLayout><VendorJobsPage /></VendorLayout>,
      },
      {
        path: "vendor/jobs/new",
        element: <VendorLayout><VendorJobCreatePage /></VendorLayout>,
      },
      {
        path: "vendor/jobs/:jobId/edit",
        element: <VendorLayout><VendorJobEditPage /></VendorLayout>,
      },
      {
        path: "admin",
        element: (
          <RoleRoute role="superadmin">
            <SuperadminDashboard />
          </RoleRoute>
        ),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
