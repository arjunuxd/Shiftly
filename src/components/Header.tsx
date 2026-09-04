import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getRoleHomePath } from "../lib/roles";
import NotificationBell from "./notifications/NotificationBell";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    authenticated,
    role,
    emailVerified,
    signOut,
  } = useAuth();

  const dashboardPath = role ? getRoleHomePath(role) : null;
  const needsVerification = authenticated && !emailVerified;

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold text-primary-600">Shiftly</span>
          </Link>

          <div className="hidden sm:flex items-center gap-6">
            <Link
              to="/jobs"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Jobs
            </Link>
            {!authenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                {needsVerification && (
                  <Link
                    to="/verify-email"
                    className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    Verify email
                  </Link>
                )}
                {role === "job_seeker" && (
                  <>
                    <Link
                      to="/job-seeker/applications"
                      className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      Applications
                    </Link>
                    <Link
                      to="/job-seeker/messages"
                      className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      Messages
                    </Link>
                  </>
                )}
                {role === "vendor" && (
                  <Link
                    to="/vendor/messages"
                    className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    Messages
                  </Link>
                )}
                {role === "superadmin" && (
                  <Link
                    to="/admin"
                    className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                {dashboardPath && (
                  <Link
                    to={dashboardPath}
                    className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                <NotificationBell />
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            className="sm:hidden p-2 text-neutral-600 hover:text-neutral-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden pb-4 border-t border-neutral-100 mt-2 pt-4">
            <div className="flex flex-col gap-3">
              <Link
                to="/jobs"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Jobs
              </Link>
              {!authenticated ? (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  {role === "job_seeker" && (
                    <>
                      <Link
                        to="/job-seeker/applications"
                        className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-2 py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Applications
                      </Link>
                      <Link
                        to="/job-seeker/messages"
                        className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-2 py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Messages
                      </Link>
                      <Link
                        to="/job-seeker/notifications"
                        className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-2 py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Notifications
                      </Link>
                    </>
                  )}
                  {role === "vendor" && (
                    <>
                      <Link
                        to="/vendor/messages"
                        className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-2 py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Messages
                      </Link>
                      <Link
                        to="/vendor/notifications"
                        className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-2 py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Notifications
                      </Link>
                    </>
                  )}
                  {role === "superadmin" && (
                    <Link
                      to="/admin"
                      className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-2 py-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  {dashboardPath && (
                    <Link
                      to={dashboardPath}
                      className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-2 py-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      void signOut();
                    }}
                    className="text-left text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-2 py-1"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
