import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StateCreator } from 'zustand/vanilla';
import { MessageInter } from "~/types";

interface ChatState {
  messages: MessageInter[];
  setMessages(messages: MessageInter[]): void;
  messages_inline: MessageInter[];
  setMessagesInline(messages: MessageInter[]): void;
  sendMessageFlag: string;
  setSendMessageFlag(sendMessageFlag: string): void;
  sendMessageFlagInline: string;
  setSendMessageFlagInline(sendMessageFlagInline: string): void;
  clearChatData(): void;
}

export const useChatStore = create<ChatState>()(persist<ChatState>((set) => ({
  messages: [],
  setMessages: (messages: MessageInter[]) => {
    if (typeof window !== 'undefined') {
      if (messages.length === 0) {
        localStorage.removeItem('chat_messages');
      } else {
        localStorage.setItem('chat_messages', JSON.stringify(messages));
      }
    }
    set({ messages });
  },
  messages_inline: [],
  setMessagesInline: (messages_inline: MessageInter[]) => {
    if (typeof window !== 'undefined') {
      if (messages_inline.length === 0) {
        localStorage.removeItem('chat_messages_inline');
      } else {
        localStorage.setItem('chat_messages_inline', JSON.stringify(messages_inline));
      }
    }
    set({ messages_inline });
  },
  sendMessageFlag: "",
  setSendMessageFlag: (sendMessageFlag: string) => set({ sendMessageFlag }),
  sendMessageFlagInline: "",
  setSendMessageFlagInline: (sendMessageFlagInline: string) =>
    set({ sendMessageFlagInline }),
  clearChatData: () => {
    set({ messages: [], messages_inline: [] });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chat_messages');
      localStorage.removeItem('chat_messages_inline');
    }
  }
}), {
  name: 'chat-storage',
  version: 1,
  storage: {
    getItem: (name) => {
      if (typeof window === 'undefined') return null;
      try {
        const value = localStorage.getItem(name);
        return value ? JSON.parse(value) : null;
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(name, JSON.stringify(value));
        } catch {}
      }
    },
    removeItem: (name) => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(name);
        } catch {}
      }
    }
  },
  partialize: (state) => ({
    messages: state.messages,
    messages_inline: state.messages_inline,
    sendMessageFlag: state.sendMessageFlag,
    sendMessageFlagInline: state.sendMessageFlagInline,
    setMessages: state.setMessages,
    setMessagesInline: state.setMessagesInline,
    setSendMessageFlag: state.setSendMessageFlag,
    setSendMessageFlagInline: state.setSendMessageFlagInline,
    clearChatData: state.clearChatData
  })
}));

export const getStorage = () => typeof window !== 'undefined' ? localStorage : null;
