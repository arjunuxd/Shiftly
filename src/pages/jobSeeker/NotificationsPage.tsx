import { useState, useEffect, useCallback } from "react";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../lib/api";
import { getCurrentIdToken } from "../../lib/auth";
import NotificationList from "../../components/notifications/NotificationList";
import JobSeekerNav from "../../components/jobSeeker/JobSeekerNav";
import type { AppNotification } from "../../types";
import { FriendlyAlert } from "../../components/ui/FormField";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifications = useCallback(async (token: string | undefined, page?: string, append = false) => {
    try {
      const result = await getNotifications(token!, page);
      if (append) {
        setNotifications((prev) => [...prev, ...result.notifications]);
      } else {
        setNotifications(result.notifications);
      }
      setUnreadCount(result.unreadCount);
      setPageToken(result.nextPageToken);
      setHasMore(result.hasMore);
      setError(null);
    } catch {
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getCurrentIdToken()
      .then((token) => {
        if (active) return fetchNotifications(token);
      })
      .catch(() => setLoading(false));
    return () => {
      active = false;
    };
  }, [fetchNotifications]);

  const handleRead = useCallback(async (id: string) => {
    try {
      const token = await getCurrentIdToken();
      await markNotificationAsRead(token, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // non-blocking
    }
  }, []);

  const handleReadAll = useCallback(async () => {
    try {
      const token = await getCurrentIdToken();
      await markAllNotificationsAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // non-blocking
    }
  }, []);

  const handleLoadMore = () => {
    if (pageToken) {
      setLoadingMore(true);
      getCurrentIdToken()
        .then((token) => fetchNotifications(token, pageToken, true))
        .catch(() => setLoadingMore(false));
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="h-8 w-48 bg-neutral-200 rounded mb-8 animate-pulse" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-neutral-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <JobSeekerNav />
      <div className="mt-6 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-1">Notifications</h1>
          <p className="text-neutral-500">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => void handleReadAll()}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {error ? (
        <FriendlyAlert icon="error" title="We couldn't load your notifications">
          {error}
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              getCurrentIdToken().then((t) => fetchNotifications(t)).catch(() => setLoading(false));
            }}
            className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
          >
            Try Again
          </button>
        </FriendlyAlert>
      ) : (
        <>
          <NotificationList notifications={notifications} onRead={handleRead} />

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
