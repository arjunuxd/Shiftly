import { Link, useLocation } from "react-router-dom";

const LINKS = [
  { to: "/vendor", label: "Home" },
  { to: "/vendor/jobs", label: "Jobs" },
  { to: "/vendor/messages", label: "Messages" },
  { to: "/vendor/notifications", label: "Notifications" },
  { to: "/vendor/profile", label: "Profile" },
] as const;

export default function VendorNav() {
  const location = useLocation();

  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
      {LINKS.map((link) => {
        const isHome = link.to === "/vendor";
        const active = isHome
          ? location.pathname === link.to
          : location.pathname === link.to ||
            location.pathname.startsWith(`${link.to}/`);
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              active
                ? "bg-primary-600 text-white"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}