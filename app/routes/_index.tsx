import type { MetaFunction } from "@remix-run/node";
import ChatInput from "~/components/chat/ChatInput";
import ChatContent from "~/components/chat/ChatContent";
import ChatDialog from "~/components/chat/ChatDialog";
import ChatSetting from "~/components/chat/ChatSetting";
import ChatSidebar from "~/components/chat/ChatSidebar";
import { asyncOAuthToken } from "~/apis/data";
import { useEffect, useState } from "react";
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
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const chatStore = useChatStore();
  
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
    
    // 加载聊天历史
    loadChatHistory();
  }, []);
  
  // 加载聊天历史
  const loadChatHistory = () => {
    const storedHistory = localStorage.getItem("chat_history");
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        setChatHistory(parsedHistory);
      } catch (error) {
        console.error("Failed to parse chat history:", error);
      }
    }
  };
  
  // 选择聊天
  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    const selectedChat = chatHistory.find(chat => chat.id === chatId);
    if (selectedChat) {
      chatStore.setMessages(selectedChat.messages || []);
    }
  };
  
  // 创建新聊天
  const handleNewChat = () => {
    // 使用函数式更新确保使用最新的chatHistory状态
    setChatHistory(prevHistory => {
      const newChatId = Date.now().toString();
      const newChat = {
        id: newChatId,
        title: "新的对话",
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: []
      };
      
      // 确保新对话添加在列表顶部
      const updatedHistory = [newChat, ...prevHistory];
      
      // 保存到localStorage
      localStorage.setItem("chat_history", JSON.stringify(updatedHistory));
      
      // 触发自定义事件通知其他组件
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('chatHistoryUpdate', { 
          detail: { updatedHistory }
        }));
      }, 0);
      
      // 设置活动聊天ID和清空消息
      setActiveChatId(newChatId);
      chatStore.setMessages([]);
      
      return updatedHistory;
    });
  };
  
  // 监听消息变化，保存到历史记录
  useEffect(() => {
    if (activeChatId && chatStore.messages.length > 0) {
      const updatedHistory = chatHistory.map(chat => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: chatStore.messages,
            updatedAt: new Date(),
            // 如果是用户的第一条消息，更新标题
            title: chat.title === "新的对话" && chatStore.messages[0]?.text ? 
              chatStore.messages[0].text.slice(0, 20) : chat.title
          };
        }
        return chat;
      });
      
      setChatHistory(updatedHistory);
      localStorage.setItem("chat_history", JSON.stringify(updatedHistory));
    }
  }, [chatStore.messages, activeChatId]);
  
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
