import { Link } from "react-router-dom";
import type { AppNotification } from "../../types";

const TYPE_ICONS: Record<string, string> = {
  APPLICATION_RECEIVED: "bg-primary-50 text-primary-600",
  APPLICATION_WITHDRAWN: "bg-neutral-100 text-neutral-500",
  APPLICATION_ACCEPTED: "bg-green-50 text-green-600",
  APPLICATION_REJECTED: "bg-red-50 text-red-600",
  NEW_MESSAGE: "bg-blue-50 text-blue-600",
  VERIFICATION_APPROVED: "bg-green-50 text-green-600",
  VERIFICATION_REJECTED: "bg-red-50 text-red-600",
};

function TypeIcon({ type }: { type: string }) {
  const cls = TYPE_ICONS[type] ?? "bg-neutral-100 text-neutral-500";
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cls}`}>
      {type.startsWith("APPLICATION") && (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      )}
      {type === "NEW_MESSAGE" && (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 20.105V4.875A1.875 1.875 0 015.625 3h12.75A1.875 1.875 0 0120.25 4.875v10.5A1.875 1.875 0 0118.375 17.25H7.5l-3.75 2.855z" />
        </svg>
      )}
      {type.startsWith("VERIFICATION") && (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      )}
    </div>
  );
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getLink(notification: AppNotification): string | null {
  if (notification.data.conversationId) {
    return `/job-seeker/messages`;
  }
  if (notification.data.jobId) {
    return `/jobs/${notification.data.jobId}`;
  }
  return null;
}

export function NotificationListItem({
  notification,
  onRead,
  isVendor,
}: {
  notification: AppNotification;
  onRead?: (id: string) => void;
  isVendor?: boolean;
}) {
  const link = getLink(notification);
  const handleMarkRead = () => {
    if (!notification.read && onRead) onRead(notification.id);
  };
  const inner = (
    <div
      className={`flex items-start gap-3 p-4 ${
        notification.read ? "bg-white" : "bg-primary-50/40"
      } hover:bg-neutral-50 transition-colors`}
      role={onRead && !notification.read && !link ? "button" : undefined}
      tabIndex={onRead && !notification.read && !link ? 0 : undefined}
      onClick={handleMarkRead}
      onKeyDown={(e) => {
        if (onRead && !notification.read && !link && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleMarkRead();
        }
      }}
    >
      <TypeIcon type={notification.type} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm ${notification.read ? "text-neutral-500" : "text-neutral-900 font-medium"}`}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
          )}
        </div>
        <p className="text-sm text-neutral-500 mt-0.5">{notification.body}</p>
        <p className="text-xs text-neutral-400 mt-1">{formatTime(notification.createdAt)}</p>
      </div>
    </div>
  );

  if (link && !isVendor) {
    return (
      <Link to={link} className="block border-b border-neutral-100 last:border-0">
        {inner}
      </Link>
    );
  }
  if (link && isVendor) {
    return (
      <Link to={`/vendor/messages`} className="block border-b border-neutral-100 last:border-0">
        {inner}
      </Link>
    );
  }

  return <div className="border-b border-neutral-100 last:border-0">{inner}</div>;
}

export default function NotificationList({
  notifications,
  onRead,
  isVendor,
}: {
  notifications: AppNotification[];
  onRead?: (id: string) => void;
  isVendor?: boolean;
}) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="mx-auto h-12 w-12 text-neutral-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <p className="text-neutral-700 font-medium">No notifications yet</p>
        <p className="text-neutral-500 text-sm mt-1">Updates about your applications and messages will appear here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      {notifications.map((n) => (
        <NotificationListItem
          key={n.id}
          notification={n}
          onRead={onRead}
          isVendor={isVendor}
        />
      ))}
    </div>
  );
}
