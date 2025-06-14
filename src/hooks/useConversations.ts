import { useEffect, useState } from "react";
import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface Message {
  message: string;
  type: "bot" | "user";
}

export interface Conversation {
  id: string;
  timestamp: number;
  messages: Message[];
}

interface ConversationDB extends DBSchema {
  conversations: {
    key: string;
    value: Conversation;
    indexes: { "by-timestamp": number };
  };
}

let dbPromise: Promise<IDBPDatabase<ConversationDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<ConversationDB>("locallm-conversations", 1, {
      upgrade(db) {
        const store = db.createObjectStore("conversations", { keyPath: "id" });
        store.createIndex("by-timestamp", "timestamp");
      },
    });
  }
  return dbPromise;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const getAll = async () => {
    const db = await getDB();
    const all = await db.getAll("conversations");
    all.sort((a, b) => b.timestamp - a.timestamp);
    setConversations(all);
    return all;
  };

  useEffect(() => {
    (async () => {
      const all = await getAll();
      if (all.length > 0) {
        setSelectedId(all[0].id);
        setSelectedConversation(all[0]);
      }
    })();
  }, []);

  const refresh = async () => {
    const all = await getAll();
    if (selectedId) {
      const db = await getDB();
      const current = await db.get("conversations", selectedId);
      setSelectedConversation(current || null);
    } else {
      setSelectedConversation(null);
    }
  };

  const add = async () => {
    const db = await getDB();
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      messages: [],
    };
    await db.put("conversations", newConv);
    await refresh();
    setSelectedId(newConv.id);
    setSelectedConversation(newConv);
    return newConv;
  };

  const deleteOne = async (id: string) => {
    const db = await getDB();
    await db.delete("conversations", id);
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedConversation(null);
    }
    await refresh();
  };

  const clearAll = async () => {
    const db = await getDB();
    await db.clear("conversations");
    setConversations([]);
    setSelectedId(null);
    setSelectedConversation(null);
  };

  const selectById = async (id: string) => {
    const db = await getDB();
    const conv = await db.get("conversations", id);
    setSelectedId(id);
    setSelectedConversation(conv || null);
  };

  const addMessage = async (id: string, message: Message) => {
    const db = await getDB();
    const conv = await db.get("conversations", id);
    if (!conv) return;
    conv.messages.push(message);
    await db.put("conversations", conv);
    if (selectedId === id) {
      setSelectedConversation({ ...conv });
    }
  };

  return {
    conversations,
    selectedConversation,
    getAll,
    add,
    deleteOne,
    clearAll,
    selectById,
    addMessage,
  };
}
