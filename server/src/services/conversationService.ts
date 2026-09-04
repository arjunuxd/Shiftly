import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import { AppError } from "../middleware/errorHandler.js";
import type {
  ConversationDocument,
  ConversationResponse,
  MessageDocument,
  MessageResponse,
} from "../types/conversation.js";

const CONVERSATIONS = "conversations";
const MESSAGES = "messages";

function toIso(v: unknown): string | null {
  if (v && typeof v === "object" && "toDate" in v) {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

function serializeConversation(id: string, data: ConversationDocument): ConversationResponse {
  return {
    id,
    participantVendorId: data.participantVendorId,
    participantJobSeekerId: data.participantJobSeekerId,
    applicationId: data.applicationId,
    jobId: data.jobId,
    lastMessageText: data.lastMessageText,
    lastMessageAt: toIso(data.lastMessageAt),
    createdAt: toIso(data.createdAt),
  };
}

function serializeMessage(id: string, data: MessageDocument): MessageResponse {
  return {
    id,
    senderId: data.senderId,
    text: data.text,
    createdAt: toIso(data.createdAt),
  };
}

function makeConversationId(vendorId: string, jobSeekerId: string): string {
  const sorted = [vendorId, jobSeekerId].sort();
  return `${sorted[0]}_${sorted[1]}`;
}

export async function getOrCreateConversation(
  vendorId: string,
  jobSeekerId: string,
  applicationId: string,
  jobId: string,
): Promise<ConversationResponse> {
  const db = getAdminFirestore();
  const conversationId = makeConversationId(vendorId, jobSeekerId);
  const ref = db.collection(CONVERSATIONS).doc(conversationId);
  const snapshot = await ref.get();

  if (snapshot.exists) {
    return serializeConversation(
      snapshot.id,
      snapshot.data() as ConversationDocument,
    );
  }

  const now = FieldValue.serverTimestamp();
  const doc: ConversationDocument = {
    participantVendorId: vendorId,
    participantJobSeekerId: jobSeekerId,
    applicationId,
    jobId,
    lastMessageText: "",
    lastMessageAt: now,
    createdAt: now,
  };

  await ref.set(doc);

  return {
    id: conversationId,
    participantVendorId: vendorId,
    participantJobSeekerId: jobSeekerId,
    applicationId,
    jobId,
    lastMessageText: "",
    lastMessageAt: null,
    createdAt: null,
  };
}

export async function getConversationsForUser(
  userId: string,
  role: "vendor" | "job_seeker",
): Promise<ConversationResponse[]> {
  const db = getAdminFirestore();
  const field = role === "vendor"
    ? "participantVendorId"
    : "participantJobSeekerId";

  const snapshot = await db
    .collection(CONVERSATIONS)
    .where(field, "==", userId)
    .orderBy("lastMessageAt", "desc")
    .get();

  return snapshot.docs.map((doc) =>
    serializeConversation(doc.id, doc.data() as ConversationDocument),
  );
}

export async function getConversation(
  conversationId: string,
  userId: string,
): Promise<ConversationResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(CONVERSATIONS).doc(conversationId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new AppError(404, "Conversation not found.");
  }

  const data = snapshot.data() as ConversationDocument;
  if (data.participantVendorId !== userId && data.participantJobSeekerId !== userId) {
    throw new AppError(403, "You do not have access to this conversation.");
  }

  return serializeConversation(snapshot.id, data);
}

export async function getMessages(
  conversationId: string,
  userId: string,
  limit = 50,
  before?: string,
): Promise<MessageResponse[]> {
  const db = getAdminFirestore();
  const convRef = db.collection(CONVERSATIONS).doc(conversationId);
  const convSnapshot = await convRef.get();

  if (!convSnapshot.exists) {
    throw new AppError(404, "Conversation not found.");
  }

  const convData = convSnapshot.data() as ConversationDocument;
  if (convData.participantVendorId !== userId && convData.participantJobSeekerId !== userId) {
    throw new AppError(403, "You do not have access to this conversation.");
  }

  let query = db
    .collection(CONVERSATIONS)
    .doc(conversationId)
    .collection(MESSAGES)
    .orderBy("createdAt", "desc")
    .limit(limit);

  if (before) {
    const beforeDoc = await db
      .collection(CONVERSATIONS)
      .doc(conversationId)
      .collection(MESSAGES)
      .doc(before)
      .get();
    if (beforeDoc.exists) {
      query = query.startAfter(beforeDoc);
    }
  }

  const snapshot = await query.get();

  return snapshot.docs.map((doc) =>
    serializeMessage(doc.id, doc.data() as MessageDocument),
  ).reverse();
}

export async function createConversationMessage(
  conversationId: string,
  senderId: string,
  text: string,
): Promise<MessageResponse> {
  const db = getAdminFirestore();
  const convRef = db.collection(CONVERSATIONS).doc(conversationId);
  const convSnapshot = await convRef.get();

  if (!convSnapshot.exists) {
    throw new AppError(404, "Conversation not found.");
  }

  const convData = convSnapshot.data() as ConversationDocument;
  if (convData.participantVendorId !== senderId && convData.participantJobSeekerId !== senderId) {
    throw new AppError(403, "You do not have access to this conversation.");
  }

  const msgRef = db
    .collection(CONVERSATIONS)
    .doc(conversationId)
    .collection(MESSAGES)
    .doc();

  const now = FieldValue.serverTimestamp();
  const msgDoc: MessageDocument = {
    senderId,
    text,
    createdAt: now,
  };

  const batch = db.batch();
  batch.set(msgRef, msgDoc);
  batch.update(convRef, {
    lastMessageText: text,
    lastMessageAt: now,
  });

  await batch.commit();

  return {
    id: msgRef.id,
    senderId,
    text,
    createdAt: null,
  };
}
