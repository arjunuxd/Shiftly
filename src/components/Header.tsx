import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getRoleHomePath } from "../lib/roles";
import NotificationBell from "./notifications/NotificationBell";

const NAV_LINKS = [
  { to: "/jobs", label: "Jobs" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about", label: "About" },
] as const;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { authenticated, role, signOut } = useAuth();

  const dashboardPath = role ? getRoleHomePath(role) : null;
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navSolid = !isHome || scrolled || mobileOpen;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        navSolid
          ? "bg-white/95 backdrop-blur-md border-b border-neutral-200/60"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-sm">
              S
            </div>
            <span className="text-lg font-bold tracking-tight text-neutral-900">
              Shiftly
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === link.to
                    ? "text-primary-700 bg-primary-50"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {!authenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
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
                      className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors"
                    >
                      Applications
                    </Link>
                    <Link
                      to="/job-seeker/messages"
                      className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors"
                    >
                      Messages
                    </Link>
                  </>
                )}
                {role === "vendor" && (
                  <Link
                    to="/vendor/messages"
                    className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors"
                  >
                    Messages
                  </Link>
                )}
                {role === "superadmin" && (
                  <Link
                    to="/admin"
                    className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <NotificationBell />
                {dashboardPath && (
                  <Link
                    to={dashboardPath}
                    className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="px-3 py-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            type="button"
            className="md:hidden p-1.5 text-neutral-600 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-neutral-100 mt-1 pt-3 animate-fade-in">
            <div className="flex flex-col gap-0.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === link.to
                      ? "text-primary-700 bg-primary-50"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-neutral-100 my-2" />
              {!authenticated ? (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-md"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="mx-3 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg text-center hover:bg-primary-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  {role === "job_seeker" && (
                    <>
                      <Link to="/job-seeker/applications" className="px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-md" onClick={() => setMobileOpen(false)}>Applications</Link>
                      <Link to="/job-seeker/messages" className="px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-md" onClick={() => setMobileOpen(false)}>Messages</Link>
                    </>
                  )}
                  {role === "vendor" && (
                    <Link to="/vendor/messages" className="px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-md" onClick={() => setMobileOpen(false)}>Messages</Link>
                  )}
                  {role === "superadmin" && (
                    <Link to="/admin" className="px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-md" onClick={() => setMobileOpen(false)}>Admin</Link>
                  )}
                  {dashboardPath && (
                    <Link to={dashboardPath} className="mx-3 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg text-center hover:bg-primary-700" onClick={() => setMobileOpen(false)}>
                      Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => { setMobileOpen(false); void signOut(); }}
                    className="px-3 py-2.5 text-left text-sm font-medium text-neutral-500 hover:bg-neutral-100 rounded-md"
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
