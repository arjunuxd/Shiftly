import { type ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
  section: "main" | "moderation" | "system";
}

const NAV_ITEMS: NavItem[] = [
  { path: "/admin", label: "Dashboard", icon: "grid", section: "main" },
  { path: "/admin/users", label: "Users", icon: "users", section: "moderation" },
  { path: "/admin/jobs", label: "Jobs", icon: "briefcase", section: "moderation" },
  { path: "/admin/verifications", label: "Verifications", icon: "check-circle", section: "moderation" },
  { path: "/admin/reports", label: "Reports", icon: "flag", section: "moderation" },
  { path: "/admin/admins", label: "Admin Accounts", icon: "shield", section: "system" },
];

const SECTION_LABELS: Record<NavItem["section"], string> = {
  main: "Main",
  moderation: "Moderation",
  system: "System",
};

const ICONS: Record<string, string> = {
  grid: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
  users: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  briefcase: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0",
  "check-circle": "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  flag: "M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5",
  shield: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
};

function SidebarIcon({ name, className }: { name: string; className?: string }) {
  const path = ICONS[name] ?? ICONS.grid;
  return (
    <svg
      className={className ?? "h-5 w-5"}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { role, signOut, currentUser } = useAuth();

  const isSuperadmin = role === "superadmin";

  const navItems = isSuperadmin ? NAV_ITEMS : NAV_ITEMS.filter((item) => item.path !== "/admin/admins");

  const sections = ["main", "moderation", "system"].filter((section) =>
    navItems.some((item) => item.section === section),
  ) as NavItem["section"][];

  const isActive = (item: NavItem) =>
    item.path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(item.path);

  const activeItem =
    (isSuperadmin ? NAV_ITEMS : NAV_ITEMS).find(isActive) ?? navItems[0];
  const activeLabel = activeItem?.label ?? "Administration";

  const initials = (currentUser?.displayName ?? currentUser?.email ?? "A")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-neutral-100 lg:flex">
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-neutral-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-40 flex h-full w-72 flex-col
          bg-gradient-to-b from-primary-950 to-[#0b1226]
          text-white shadow-2xl
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto lg:shadow-none lg:h-screen
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-lg font-extrabold text-white shadow-lg shadow-primary-900/40">
              S
            </div>
            <span className="flex flex-col leading-tight">
              <span className="text-base font-bold tracking-tight text-white">
                Shiftly Admin
              </span>
              <span className="text-[11px] font-medium uppercase tracking-widest text-primary-300/80">
                Control Panel
              </span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="Close navigation menu"
            className="flex h-11 min-h-[44px] min-w-[44px] items-center justify-center p-2.5 text-primary-200 transition-colors hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <svg className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {sections.map((section) => (
            <div key={section}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-primary-300/70">
                {SECTION_LABELS[section]}
              </p>
              <div className="space-y-1">
                {navItems
                  .filter((item) => item.section === section)
                  .map((item) => {
                    const active = isActive(item);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150
                          ${active ? "bg-white/10 text-white" : "text-primary-200/90 hover:bg-white/5 hover:text-white"}
                        `}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent-400" />
                        )}
                        <SidebarIcon
                          name={item.icon}
                          className={`h-5 w-5 shrink-0 ${active ? "text-accent-300" : "text-primary-300/80 group-hover:text-primary-200"}`}
                        />
                        {item.label}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 space-y-1 border-t border-white/10 p-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-primary-200/90 transition-colors hover:bg-white/5 hover:text-white"
          >
            <svg className="h-5 w-5 text-primary-300/80" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
            </svg>
            View website
          </Link>
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-primary-200/90 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <svg className="h-5 w-5 text-primary-300/80" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3 lg:px-8">
          <button
            type="button"
            aria-label="Open navigation menu"
            className="flex h-11 min-h-[44px] min-w-[44px] items-center justify-center p-2.5 text-neutral-500 transition-colors hover:text-neutral-900 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
              Administration
            </p>
            <h1 className="truncate text-lg font-bold tracking-tight text-neutral-900">
              {activeLabel}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {isSuperadmin ? "Super Admin" : "Admin"}
            </span>

            <div className="hidden items-center gap-2.5 border-l border-neutral-200 pl-3 md:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                {initials}
              </span>
              <div className="leading-tight">
                <p className="max-w-[160px] truncate text-sm font-semibold text-neutral-900">
                  {currentUser?.displayName ?? "Administrator"}
                </p>
                <p className="max-w-[180px] truncate text-xs text-neutral-400">
                  {currentUser?.email}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main id="admin-main-content" className="flex-1 p-4 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}