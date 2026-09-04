import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import type {
  NotificationDocument,
  NotificationResponse,
  NotificationType,
  NotificationListResponse,
} from "../types/notification.js";

const COLLECTION = "notifications";
const PAGE_SIZE = 20;

function toIso(v: unknown): string | null {
  if (v && typeof v === "object" && "toDate" in v) {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

function serializeNotification(
  id: string,
  data: NotificationDocument,
): NotificationResponse {
  return {
    id,
    recipientId: data.recipientId,
    type: data.type,
    title: data.title,
    body: data.body,
    read: data.read,
    readAt: toIso(data.readAt),
    createdAt: toIso(data.createdAt),
    actorId: data.actorId ?? null,
    data: data.data ?? {},
  };
}

interface CreateNotificationInput {
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  actorId?: string | null;
  data?: NotificationDocument["data"];
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<NotificationResponse> {
  if (!input.recipientId || input.recipientId.length === 0) {
    throw new Error("recipientId is required to create a notification.");
  }

  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc();

  const doc: NotificationDocument = {
    recipientId: input.recipientId,
    type: input.type,
    title: input.title,
    body: input.body,
    read: false,
    readAt: null,
    createdAt: FieldValue.serverTimestamp(),
    actorId: input.actorId ?? null,
    data: input.data ?? {},
  };

  await ref.set(doc);

  return serializeNotification(ref.id, doc);
}

export async function getNotifications(
  userId: string,
  pageToken?: string,
): Promise<NotificationListResponse> {
  const db = getAdminFirestore();
  let query = db
    .collection(COLLECTION)
    .where("recipientId", "==", userId)
    .orderBy("createdAt", "desc");

  const fetchLimit = PAGE_SIZE + 1;

  if (pageToken) {
    const startDoc = await db.collection(COLLECTION).doc(pageToken).get();
    if (startDoc.exists) {
      query = query.startAfter(startDoc);
    }
  }

  query = query.limit(fetchLimit);

  const snapshot = await query.get();
  let notifications = snapshot.docs.map((doc) =>
    serializeNotification(doc.id, doc.data() as NotificationDocument),
  );

  const hasMore = notifications.length > PAGE_SIZE;
  if (hasMore) {
    notifications = notifications.slice(0, PAGE_SIZE);
  }

  const lastDoc = snapshot.docs[hasMore ? PAGE_SIZE - 1 : snapshot.docs.length - 1];
  const nextPageToken = hasMore && lastDoc ? lastDoc.id : null;

  const unreadSnapshot = await db
    .collection(COLLECTION)
    .where("recipientId", "==", userId)
    .where("read", "==", false)
    .count()
    .get();

  return {
    notifications,
    unreadCount: unreadSnapshot.data().count,
    nextPageToken,
    hasMore,
  };
}

export async function getUnreadCount(userId: string): Promise<number> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where("recipientId", "==", userId)
    .where("read", "==", false)
    .count()
    .get();

  return snapshot.data().count;
}

export async function markNotificationAsRead(
  notificationId: string,
  userId: string,
): Promise<NotificationResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(notificationId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new Error("Notification not found.");
  }

  const data = snapshot.data() as NotificationDocument;
  if (data.recipientId !== userId) {
    throw new Error("You do not have access to this notification.");
  }

  if (!data.read) {
    await ref.update({
      read: true,
      readAt: FieldValue.serverTimestamp(),
    });
  }

  const updated = await ref.get();
  return serializeNotification(
    updated.id,
    updated.data() as NotificationDocument,
  );
}

export async function markAllNotificationsAsRead(
  userId: string,
): Promise<{ updated: number }> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where("recipientId", "==", userId)
    .where("read", "==", false)
    .get();

  const batch = db.batch();
  for (const doc of snapshot.docs) {
    batch.update(doc.ref, {
      read: true,
      readAt: FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();

  return { updated: snapshot.size };
}
