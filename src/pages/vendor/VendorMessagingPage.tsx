import { useState, useEffect, useRef, useCallback } from "react";
import { getCurrentIdToken } from "../../lib/auth";
import { getConversations, sendConversationMessage } from "../../lib/api";
import { db } from "../../lib/firestore";
import {
  collection,
  query,
  orderBy,
  limit as fsLimit,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "../../context/useAuth";
import VendorNav from "../../components/vendor/VendorNav";
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
  const sorted = [...conversations].sort((a, b) =>
    (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""),
  );

  if (sorted.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <p className="mt-3 text-sm font-medium text-neutral-700">No conversations yet</p>
        <p className="mt-1 text-xs text-neutral-500">
          Conversations with workers start once an application is accepted.
        </p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1">
      {sorted.map((conv) => {
        const active = selectedId === conv.id;
        return (
          <button
            key={conv.id}
            type="button"
            onClick={() => onSelect(conv.id)}
            className={`w-full rounded-xl text-left transition-colors ${
              active ? "bg-primary-50 ring-1 ring-primary-200" : "hover:bg-neutral-50"
            }`}
          >
            <div className="flex items-center gap-3 p-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                  active ? "bg-primary-600 text-white" : "bg-primary-100 text-primary-700"
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-neutral-900 truncate">
                    Worker #{conv.participantJobSeekerId.slice(-6)}
                  </p>
                  <span className="text-[11px] text-neutral-400 shrink-0">
                    {formatTime(conv.lastMessageAt)}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 truncate mt-0.5">
                  {conv.lastMessageText || "No messages yet"}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ChatView({
  conversation,
  currentUserId,
}: {
  conversation: Conversation;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    const messagesRef = collection(db, "conversations", conversation.id, "messages");
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
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newText.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      const token = await getCurrentIdToken();
      await sendConversationMessage(token, conversation.id, trimmed);
      setNewText("");
    } catch {
      // error handled silently
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 bg-white">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900 truncate">
            Worker #{conversation.participantJobSeekerId.slice(-6)}
          </p>
          <p className="text-xs text-neutral-400">Messaging with the job seeker</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-neutral-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-neutral-300 shadow-sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 20.105V4.875A1.875 1.875 0 015.625 3h12.75A1.875 1.875 0 0120.25 4.875v10.5A1.875 1.875 0 0118.375 17.25H7.5l-3.75 2.855z" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-medium text-neutral-600">No messages yet</p>
            <p className="mt-1 text-xs text-neutral-400">Say hello and introduce yourself.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const own = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-xl px-4 py-2.5 ${
                    own
                      ? "bg-primary-600 text-white rounded-br-sm"
                      : "bg-white text-neutral-900 rounded-bl-sm border border-neutral-200 shadow-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                  {msg.createdAt && (
                    <p className={`text-[11px] mt-1 ${own ? "text-primary-200" : "text-neutral-400"}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={(e) => void handleSend(e)} className="border-t border-neutral-200 bg-white p-3">
        <div className="flex gap-2">
          <input
            type="text"
            aria-label="Type a message"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newText.trim() || sending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
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

  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <VendorNav />
      <div className="mt-6 mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">Messages</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="flex h-[70vh] max-h-[760px] min-h-[440px] overflow-hidden">
            <div className={`w-full sm:w-80 shrink-0 overflow-y-auto border-r border-neutral-200 ${selectedId ? "hidden sm:block" : ""}`}>
              <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white p-4">
                <h2 className="text-sm font-semibold text-neutral-900">Conversations</h2>
              </div>
              <ConversationList
                conversations={conversations}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>

            <div className={`min-w-0 flex-1 ${!selectedId ? "hidden sm:flex" : "flex"} flex-col`}>
              {selectedConversation && currentUser ? (
                <>
                  <div className="flex items-center gap-2 p-3 border-b border-neutral-200 sm:hidden bg-white">
                    <button
                      type="button"
                      aria-label="Back to conversations"
                      onClick={() => setSelectedId(null)}
                      className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      &larr; Conversations
                    </button>
                  </div>
                  <ChatView
                    key={selectedConversation.id}
                    conversation={selectedConversation}
                    currentUserId={currentUser.uid}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-neutral-400 px-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 20.105V4.875A1.875 1.875 0 015.625 3h12.75A1.875 1.875 0 0120.25 4.875v10.5A1.875 1.875 0 0118.375 17.25H7.5l-3.75 2.855z" />
                    </svg>
                  </div>
                  <p className="mt-3 text-sm font-medium text-neutral-500">
                    Select a conversation to start messaging
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Choose a conversation from the list to view the chat.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}