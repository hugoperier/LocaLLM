import { create } from "zustand";
import { ConversationSummaryService } from "@/lib/services/conversationSummary";
import { storageService } from "@/lib/services/storage";
import { ChatMessage } from "@/lib/types";

export interface Conversation {
  id: string;
  timestamp: number;
  messages: ChatMessage[];
  title: string;
}

interface ConversationStore {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  add: () => void;
  deleteOne: (id: string) => void;
  clearAll: () => void;
  selectById: (id: string) => void;
  addMessage: (conversationId: string, message: ChatMessage) => Promise<void>;
  updateTitle: (conversationId: string, title: string) => void;
  loadFromStorage: () => Promise<void>;
}

export const useConversations = create<ConversationStore>((set, get) => ({
  conversations: [],
  selectedConversation: null,

  loadFromStorage: async () => {
    try {
      const conversations = await storageService.loadConversations();
      set({ conversations });
    } catch (error) {
      console.error("Failed to load conversations from storage:", error);
    }
  },

  add: () => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      messages: [],
      title: "Nouvelle conversation",
    };

    set((state) => {
      const newState = {
        conversations: [newConversation, ...state.conversations],
        selectedConversation: newConversation,
      };
      storageService.saveConversations(newState.conversations);
      return newState;
    });
  },

  deleteOne: (id: string) => {
    set((state) => {
      const newState = {
        conversations: state.conversations.filter((conv) => conv.id !== id),
        selectedConversation:
          state.selectedConversation?.id === id
            ? state.conversations[0] || null
            : state.selectedConversation,
      };
      storageService.saveConversations(newState.conversations);
      return newState;
    });
  },

  clearAll: () => {
    set({
      conversations: [],
      selectedConversation: null,
    });
    storageService.saveConversations([]);
  },

  selectById: (id: string) => {
    set((state) => ({
      selectedConversation:
        state.conversations.find((conv) => conv.id === id) || null,
    }));
  },

  addMessage: async (conversationId: string, message: ChatMessage) => {
    set((state) => {
      const updatedConversations = state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, message],
            }
          : conv
      );

      const updatedSelectedConversation =
        state.selectedConversation?.id === conversationId
          ? {
              ...state.selectedConversation,
              messages: [...state.selectedConversation.messages, message],
            }
          : state.selectedConversation;

      const newState = {
        conversations: updatedConversations,
        selectedConversation: updatedSelectedConversation,
      };
      storageService.saveConversations(newState.conversations);
      return newState;
    });

    // Generate summary if this is the first user message
    const conversation = get().conversations.find((conv) => conv.id === conversationId);
    if (conversation && message.role === "user" && conversation.messages.length === 1) {
      const summaryService = ConversationSummaryService.getInstance();
      const summary = await summaryService.generateSummary(conversationId, message);
      get().updateTitle(conversationId, summary);
    }
  },

  updateTitle: (conversationId: string, title: string) => {
    set((state) => {
      const newState = {
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, title } : conv
        ),
        selectedConversation:
          state.selectedConversation?.id === conversationId
            ? { ...state.selectedConversation, title }
            : state.selectedConversation,
      };
      storageService.saveConversations(newState.conversations);
      return newState;
    });
  },
}));
