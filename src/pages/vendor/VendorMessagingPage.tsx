import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { getCurrentIdToken } from "../../lib/auth";
import { getConversations } from "../../lib/api";
import { db } from "../../lib/firestore";
import {
  collection,
  query,
  orderBy,
  limit as fsLimit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../../context/useAuth";
import type { Conversation, Message } from "../../types";

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="divide-y divide-neutral-100">
      {conversations.length === 0 ? (
        <p className="p-6 text-sm text-neutral-500 text-center">
          No conversations yet.
        </p>
      ) : (
        conversations.map((conv) => (
          <button
            key={conv.id}
            type="button"
            onClick={() => onSelect(conv.id)}
            className={`w-full text-left p-4 hover:bg-neutral-50 transition-colors ${
              selectedId === conv.id ? "bg-primary-50" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  Worker #{conv.participantJobSeekerId.slice(0, 8)}
                </p>
                {conv.lastMessageText && (
                  <p className="text-xs text-neutral-500 truncate mt-0.5">
                    {conv.lastMessageText}
                  </p>
                )}
              </div>
              <span className="text-xs text-neutral-400 shrink-0">
                {formatTime(conv.lastMessageAt)}
              </span>
            </div>
          </button>
        ))
      )}
    </div>
  );
}

function ChatView({
  conversationId,
  currentUserId,
}: {
  conversationId: string;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"), fsLimit(200));

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((d) => {
        const data = d.data();
        const createdAt = data.createdAt && typeof data.createdAt === "object" && "toDate" in data.createdAt
          ? (data.createdAt as { toDate: () => Date }).toDate().toISOString()
          : null;
        return {
          id: d.id,
          senderId: data.senderId as string,
          text: data.text as string,
          createdAt,
        };
      });
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsub();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newText.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      const messagesRef = collection(db, "conversations", conversationId, "messages");
      await addDoc(messagesRef, {
        senderId: currentUserId,
        text: trimmed,
        createdAt: serverTimestamp(),
      });

      const convRef = doc(db, "conversations", conversationId);
      await updateDoc(convRef, {
        lastMessageText: trimmed,
        lastMessageAt: serverTimestamp(),
      });

      setNewText("");
    } catch {
      // error handled silently
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center mt-8">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-xl px-4 py-2.5 ${
                  msg.senderId === currentUserId
                    ? "bg-primary-600 text-white"
                    : "bg-neutral-100 text-neutral-900"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                {msg.createdAt && (
                  <p className={`text-xs mt-1 ${msg.senderId === currentUserId ? "text-primary-200" : "text-neutral-400"}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={(e) => void handleSend(e)} className="border-t border-neutral-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newText.trim() || sending}
            className="inline-flex items-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default function VendorMessagingPage() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getCurrentIdToken();
      const data = await getConversations(token);
      setConversations(data);
    } catch {
      // non-blocking
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link
          to="/vendor"
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          &larr; Dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">Messages</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="flex min-h-[400px]">
            {/* Conversation list */}
            <div className={`w-full sm:w-80 border-r border-neutral-200 ${selectedId ? "hidden sm:block" : ""}`}>
              <div className="p-4 border-b border-neutral-100">
                <h2 className="text-sm font-semibold text-neutral-900">Conversations</h2>
              </div>
              <ConversationList
                conversations={conversations}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>

            {/* Chat area */}
            <div className={`flex-1 ${!selectedId ? "hidden sm:flex" : "flex"} flex-col`}>
              {selectedId && currentUser ? (
                <ChatView
                  key={selectedId}
                  conversationId={selectedId}
                  currentUserId={currentUser.uid}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
                  Select a conversation to start messaging
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
