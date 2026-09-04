import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { getCurrentIdToken } from "../../lib/auth";
import { getUnreadNotificationCount } from "../../lib/api";

export default function NotificationBell() {
  const { authenticated, role } = useAuth();
  const [count, setCount] = useState(0);

  const refreshCount = useCallback(async () => {
    if (!authenticated) {
      setCount(0);
      return;
    }
    try {
      const token = await getCurrentIdToken();
      const n = await getUnreadNotificationCount(token);
      setCount(n);
    } catch {
      setCount(0);
    }
  }, [authenticated]);

  useEffect(() => {
    void refreshCount();
    const interval = setInterval(() => {
      void refreshCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshCount]);

  if (!authenticated || !role || role === "superadmin") return null;

  const path = role === "vendor" ? "/vendor/notifications" : "/job-seeker/notifications";

  return (
    <Link
      to={path}
      onClick={() => setCount(0)}
      className="relative inline-flex items-center text-neutral-600 hover:text-neutral-900 transition-colors"
      aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
      {count > 0 && (
        <span aria-hidden="true" className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-red-500 text-[10px] font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
