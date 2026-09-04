export type NotificationType =
  | "APPLICATION_RECEIVED"
  | "APPLICATION_WITHDRAWN"
  | "APPLICATION_ACCEPTED"
  | "APPLICATION_REJECTED"
  | "NEW_MESSAGE"
  | "VERIFICATION_APPROVED"
  | "VERIFICATION_REJECTED";

export interface NotificationDocument {
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  readAt: unknown | null;
  createdAt: unknown;
  actorId: string | null;
  data: {
    jobId?: string | null;
    applicationId?: string | null;
    conversationId?: string | null;
    verificationType?: string | null;
    reason?: string | null;
  };
}

export interface NotificationResponse {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  readAt: string | null;
  createdAt: string | null;
  actorId: string | null;
  data: {
    jobId?: string | null;
    applicationId?: string | null;
    conversationId?: string | null;
    verificationType?: string | null;
    reason?: string | null;
  };
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  unreadCount: number;
  nextPageToken: string | null;
  hasMore: boolean;
}
