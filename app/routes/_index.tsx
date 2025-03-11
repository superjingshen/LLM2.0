import type { MetaFunction } from "@remix-run/node";
import ChatInput from "~/components/chat/ChatInput";
import ChatContent from "~/components/chat/ChatContent";
import ChatDialog from "~/components/chat/ChatDialog";
import ChatSetting from "~/components/chat/ChatSetting";
import ChatSidebar, { ChatHistoryItem } from "~/components/chat/ChatSidebar";
import { asyncOAuthToken } from "~/apis/data";
import { useEffect, useState, useCallback } from "react";
import { getStorageSetting, updateTwoToken } from "~/utils/storage";
import { toast } from "sonner";
import { ChatError } from "~/utils/error";
import { ThemeMode } from "~/types";
import { applyThemeMode } from "~/utils/color-scheme";
import { useChatStore } from "~/store/index";

export const meta: MetaFunction = () => {
  return [
    { title: "LLM 2.0" },
    { name: "description", content: "Welcome to Chat!" },
  ];
};

export default function Index() {
  const [activeChatId, setActiveChatId] = useState<string | undefined>();
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const chatStore = useChatStore();
  
  const loadChatHistory = useCallback(() => {
    const storedHistory = localStorage.getItem("chat_history");
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        setChatHistory(parsedHistory);
        
        // 只在初始加载或明确需要加载特定聊天时设置消息
        // 避免在每次activeChatId变化时都重新设置消息
        if (activeChatId) {
          const activeChat = parsedHistory.find((chat: ChatHistoryItem) => chat.id === activeChatId);
          if (activeChat && activeChat.messages && !chatStore.messages.length) {
            chatStore.setMessages(activeChat.messages);
          }
        } else if (parsedHistory.length > 0) {
          setActiveChatId(parsedHistory[0].id);
          if (!chatStore.messages.length) {
            chatStore.setMessages(parsedHistory[0].messages || []);
          }
        }
        
        const chatIds = new Set(parsedHistory.map((chat: ChatHistoryItem) => chat.id));
        const messagesKey = 'chat_messages';
        const messagesInlineKey = 'chat_messages_inline';
        
        if (!chatIds.has(activeChatId) && localStorage.getItem(messagesKey)) {
          localStorage.removeItem(messagesKey);
        }
        if (!chatIds.has(activeChatId) && localStorage.getItem(messagesInlineKey)) {
          localStorage.removeItem(messagesInlineKey);
        }
      } catch (error) {
        console.error("Failed to parse chat history:", error);
      }
    } else if (!chatStore.messages.length) {
      chatStore.clearChatData();
    }
  }, [activeChatId, chatStore.messages.length]);
  
  useEffect(() => {
    applyThemeMode(ThemeMode.Auto);
    const code = new URLSearchParams(window.location.search).get("code");
    const init = async () => {
      try {
        if (code) {
          const res = await asyncOAuthToken(
            code,
            getStorageSetting()?.code_verifier
          );
          const data = await res.json();
          if (data.access_token) {
            updateTwoToken(data.access_token, data.refresh_token);
            toast.success("Authorization successful");
            window.location.href = "/";
          } else throw new Error(data.error_message);
        }
      } catch (error) {
        console.log("error", error);
        const err = ChatError.fromError(error);
        toast.error(err.message);
      }
    };
    init();
    loadChatHistory();
  }, [loadChatHistory]);
  
  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    const selectedChat = chatHistory.find((chat: ChatHistoryItem) => chat.id === chatId);
    if (selectedChat) {
      chatStore.setMessages(selectedChat.messages || []);
    } else {
      chatStore.clearChatData();
    }
  };
  
  const handleNewChat = () => {
    setChatHistory(prevHistory => {
      const newChatId = Date.now().toString();
      const newChat: ChatHistoryItem = {
        id: newChatId,
        title: "新的对话",
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: []
      };
      
      const updatedHistory = [newChat, ...prevHistory];
      localStorage.setItem("chat_history", JSON.stringify(updatedHistory));
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('chatHistoryUpdate', { 
          detail: { updatedHistory }
        }));
      }, 0);
      
      setActiveChatId(newChatId);
      chatStore.setMessages([]);
      
      return updatedHistory;
    });
  };
  
  useEffect(() => {
    if (activeChatId && chatStore.messages) {
      const chatExists = chatHistory.some((chat: ChatHistoryItem) => chat.id === activeChatId);
      
      if (chatExists) {
        const currentChat = chatHistory.find(chat => chat.id === activeChatId);
        if (currentChat && JSON.stringify(currentChat.messages) === JSON.stringify(chatStore.messages)) {
          return; // 如果消息没有变化，不进行任何更新
        }
        
        // 使用防抖函数延迟保存到localStorage
        const timeoutId = setTimeout(() => {
          const updatedHistory = chatHistory.map((chat: ChatHistoryItem) => {
            if (chat.id === activeChatId) {
              return {
                ...chat,
                messages: chatStore.messages,
                updatedAt: new Date(),
                title: chat.title === "新的对话" && chatStore.messages[0]?.text ? 
                  chatStore.messages[0].text.slice(0, 20) : chat.title
              };
            }
            return chat;
          });
          
          // 只有当历史记录确实发生变化时才更新状态和触发事件
          if (JSON.stringify(chatHistory) !== JSON.stringify(updatedHistory)) {
            localStorage.setItem("chat_history", JSON.stringify(updatedHistory));
            setChatHistory(updatedHistory);
            
            // 触发自定义事件通知其他组件聊天历史已更新，但不传递activeChatId
            window.dispatchEvent(new CustomEvent('chatHistoryUpdate', { 
              detail: { updatedHistory }
            }));
          }
        }, 300);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [chatStore.messages, activeChatId, chatHistory]);
  
  return (
    <div className="h-screen overflow-hidden flex">
      <ChatSidebar 
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
      />
      <div className="flex-1 flex flex-col h-full">
        <div className="flex justify-between p-3 border-b">
          <ChatSetting />
          <ChatDialog />
        </div>
        <div
          className="flex flex-col w-full flex-1 overflow-hidden"
        >
          <ChatContent key={"page-content"} type={"page"} />
          <ChatInput key={"page-input"} type={"page"} />
        </div>
      </div>
    </div>
  );
}
