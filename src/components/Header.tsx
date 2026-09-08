import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getRoleProfilePath } from "../lib/roles";
import NotificationBell from "./notifications/NotificationBell";

const NAV_LINKS = [
  { to: "/jobs", label: "Jobs" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about", label: "About" },
] as const;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { authenticated, emailVerified, role, accountStatus, signOut } = useAuth();

  const profilePath = role ? getRoleProfilePath(role) : null;
  const isHome = location.pathname === "/";
  const showSearch = authenticated && role === "job_seeker";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    navigate(`/jobs?search=${encodeURIComponent(term)}`);
    setSearchTerm("");
    setMobileOpen(false);
  };

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

          {/* Desktop Search */}
          {showSearch && (
            <form onSubmit={submitSearch} className="hidden md:block flex-1 max-w-xs px-4">
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search jobs…"
                  aria-label="Search jobs"
                  className="w-full rounded-lg border border-neutral-300 bg-white py-1.5 pl-9 pr-3 text-sm text-neutral-700 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
            </form>
          )}

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
) : !emailVerified ? (
              <>
                <Link
                  to="/verify-email"
                  className="px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 rounded-md border border-amber-200 transition-colors"
                >
                  Verify email
                </Link>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="px-3 py-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors"
                >
                  Sign Out
                </button>
              </>
) : (
                <>
                  <NotificationBell />
                  {profilePath && (
                    <Link
                      to={profilePath}
                      className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Profile
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
              {showSearch && (
                <form onSubmit={submitSearch} className="mb-2">
                  <div className="relative">
                    <svg
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search jobs…"
                      aria-label="Search jobs"
                      className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm text-neutral-700 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
                    />
                  </div>
                </form>
              )}
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
                  {!emailVerified && (
                    <Link
                      to="/verify-email"
                      className="mx-3 px-3 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 rounded-md border border-amber-200"
                      onClick={() => setMobileOpen(false)}
                    >
                      Verify email
                    </Link>
                  )}
                  {profilePath && (
                    <Link
                      to={profilePath}
                      className="mx-3 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg text-center hover:bg-primary-700"
                      onClick={() => setMobileOpen(false)}
                    >
                      Profile
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

      {accountStatus === "suspended" && (
        <div className="border-t border-red-200 bg-red-50">
          <div className="max-w-6xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8 flex items-center gap-2 text-sm">
            <svg className="h-4 w-4 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">
              <span className="font-semibold">Your account has been suspended.</span>{" "}
              You can't post jobs, apply, or send messages until it's restored.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}