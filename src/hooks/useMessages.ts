import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  limit as fsLimit,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../lib/firestore";
import type { Message } from "../types";

function toIso(v: unknown): string | null {
  if (!v || typeof v !== "object") return null;
  if ("toDate" in v) return (v as { toDate: () => Date }).toDate().toISOString();
  return null;
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"), fsLimit(200));

    unsubRef.current = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          senderId: data.senderId as string,
          text: data.text as string,
          createdAt: toIso(data.createdAt),
        };
      });
      setMessages(msgs);
      setLoading(false);
    });

    return () => {
      unsubRef.current?.();
      unsubRef.current = null;
    };
  }, [conversationId]);

  return { messages, loading };
}
