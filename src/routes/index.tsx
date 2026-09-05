import { useEffect } from "react";
import type { ReactNode } from "react";
import { createBrowserRouter, useLocation, Outlet } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import HomePage from "../pages/public/HomePage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import ForgotPasswordPage from "../pages/public/ForgotPasswordPage";
import VerifyEmailPage from "../pages/public/VerifyEmailPage";
import AboutPage from "../pages/public/AboutPage";
import HowItWorksPage from "../pages/public/HowItWorksPage";
import ContactPage from "../pages/public/ContactPage";
import PrivacyPage from "../pages/public/PrivacyPage";
import TermsPage from "../pages/public/TermsPage";
import JobSeekerDashboard from "../pages/jobSeeker/JobSeekerDashboard";
import JobSeekerProfilePage from "../pages/jobSeeker/JobSeekerProfilePage";
import JobSeekerProfilePreviewPage from "../pages/jobSeeker/JobSeekerProfilePreviewPage";
import JobSeekerProfileEditPage from "../pages/jobSeeker/JobSeekerProfileEditPage";
import JobSeekerProfileCreatePage from "../pages/jobSeeker/JobSeekerProfileCreatePage";
import JobSeekerVerifyPage from "../pages/jobSeeker/JobSeekerVerifyPage";
import JobDiscoveryPage from "../pages/jobSeeker/JobDiscoveryPage";
import JobDetailPage from "../pages/jobSeeker/JobDetailPage";
import ApplicationsPage from "../pages/jobSeeker/ApplicationsPage";
import MessagingPage from "../pages/jobSeeker/MessagingPage";
import NotificationsPage from "../pages/jobSeeker/NotificationsPage";
import VendorDashboard from "../pages/vendor/VendorDashboard";
import VendorProfilePage from "../pages/vendor/VendorProfilePage";
import VendorProfileCreatePage from "../pages/vendor/VendorProfileCreatePage";
import VendorProfileEditPage from "../pages/vendor/VendorProfileEditPage";
import VendorVerifyPage from "../pages/vendor/VendorVerifyPage";
import VendorJobsPage from "../pages/vendor/VendorJobsPage";
import VendorJobCreatePage from "../pages/vendor/VendorJobCreatePage";
import VendorJobEditPage from "../pages/vendor/VendorJobEditPage";
import VendorJobApplicantsPage from "../pages/vendor/VendorJobApplicantsPage";
import VendorApplicantProfilePage from "../pages/vendor/VendorApplicantProfilePage";
import VendorMessagingPage from "../pages/vendor/VendorMessagingPage";
import VendorNotificationsPage from "../pages/vendor/VendorNotificationsPage";
import SuperadminDashboard from "../pages/admin/SuperadminDashboard";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminAdminsPage from "../pages/admin/AdminAdminsPage";
import AdminJobsPage from "../pages/admin/AdminJobsPage";
import AdminVerificationsPage from "../pages/admin/AdminVerificationsPage";
import AdminReportsPage from "../pages/admin/AdminReportsPage";
import NotFoundPage from "../pages/NotFoundPage";
import { RoleRoute } from "../components/guards/RouteGuards";
import { ProfileProvider } from "../context/ProfileContext";
import { VendorProfileProvider } from "../context/VendorProfileContext";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      window.scrollTo(0, 0);
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

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
    element: (
      <>
        <ScrollToTop />
        <MainLayout />
      </>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "verify-email", element: <VerifyEmailPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "how-it-works", element: <HowItWorksPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "privacy", element: <PrivacyPage /> },
      { path: "terms", element: <TermsPage /> },
      { path: "jobs", element: <ProfileProvider><JobDiscoveryPage /></ProfileProvider> },
      {
        path: "jobs/:jobId",
        element: (
          <ProfileProvider>
            <JobDetailPage />
          </ProfileProvider>
        ),
      },
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
        path: "job-seeker/profile/preview",
        element: <JobSeekerLayout><JobSeekerProfilePreviewPage /></JobSeekerLayout>,
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
        path: "job-seeker/applications/:applicationId",
        element: <JobSeekerLayout><ApplicationsPage /></JobSeekerLayout>,
      },
      {
        path: "job-seeker/messages",
        element: <JobSeekerLayout><MessagingPage /></JobSeekerLayout>,
      },
      {
        path: "job-seeker/notifications",
        element: <JobSeekerLayout><NotificationsPage /></JobSeekerLayout>,
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
        path: "vendor/jobs/:jobId/applicants",
        element: <VendorLayout><VendorJobApplicantsPage /></VendorLayout>,
      },
      {
        path: "vendor/applicants/:applicationId",
        element: <VendorLayout><VendorApplicantProfilePage /></VendorLayout>,
      },
      {
        path: "vendor/messages",
        element: <VendorLayout><VendorMessagingPage /></VendorLayout>,
      },
      {
        path: "vendor/notifications",
        element: <VendorLayout><VendorNotificationsPage /></VendorLayout>,
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <>
        <ScrollToTop />
        <RoleRoute role={["admin", "superadmin"]}>
          <AdminLayout>
            <Outlet />
          </AdminLayout>
        </RoleRoute>
      </>
    ),
    children: [
      { index: true, element: <SuperadminDashboard /> },
      { path: "users", element: <AdminUsersPage /> },
      { path: "jobs", element: <AdminJobsPage /> },
      { path: "verifications", element: <AdminVerificationsPage /> },
      { path: "reports", element: <AdminReportsPage /> },
      {
        path: "admins",
        element: <RoleRoute role="superadmin"><AdminAdminsPage /></RoleRoute>,
      },
    ],
  },
]);
