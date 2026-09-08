import { Link, useLocation } from "react-router-dom";

const LINKS = [
  { to: "/job-seeker/applications", label: "Applications" },
  { to: "/job-seeker/saved-jobs", label: "Saved Jobs" },
  { to: "/job-seeker/messages", label: "Messages" },
  { to: "/job-seeker/notifications", label: "Notifications" },
  { to: "/job-seeker/profile", label: "Profile" },
] as const;

export default function JobSeekerNav() {
  const location = useLocation();

  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
      {LINKS.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            location.pathname === link.to ||
            location.pathname.startsWith(`${link.to}/`)
              ? "bg-primary-600 text-white"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}