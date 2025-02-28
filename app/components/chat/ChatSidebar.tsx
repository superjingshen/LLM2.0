import { Button } from "../ui/button";
import { PlusIcon, Pencil, Trash2, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { MessageIcon } from "../ui/icons";
import { useChatStore } from "~/store/index";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { toast } from "sonner";

export interface ChatHistoryItem {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: any[];
}

export default function ChatSidebar({
  activeChatId,
  onSelectChat,
  onNewChat,
}: {
  activeChatId?: string;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}) {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [chatToRename, setChatToRename] = useState<ChatHistoryItem | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const chatStore = useChatStore();
  
  // 检测设备类型并设置侧边栏默认状态
  useEffect(() => {
    const checkDeviceType = () => {
      // 移动设备默认收起侧边栏 (小于768px)
      setIsSidebarCollapsed(window.innerWidth < 768);
    };
    
    // 初始检测
    checkDeviceType();
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);
  
  // 统一的聊天历史加载和更新逻辑
  const loadChatHistory = () => {
    const storedHistory = localStorage.getItem("chat_history");
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        setChatHistory(parsedHistory.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        })));
      } catch (error) {
        console.error("Failed to parse chat history:", error);
      }
    }
  };

  // 初始加载和监听chatHistoryUpdate事件
  useEffect(() => {
    loadChatHistory();
    
    const handleChatHistoryUpdate = (event: CustomEvent<{updatedHistory: any}>) => {
      const { updatedHistory } = event.detail;
      setChatHistory(updatedHistory.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      })));
    };
    
    window.addEventListener('chatHistoryUpdate', handleChatHistoryUpdate as EventListener);
    return () => {
      window.removeEventListener('chatHistoryUpdate', handleChatHistoryUpdate as EventListener);
    };
  }, []);



  // 重命名聊天
  const handleRenameChat = (chat: ChatHistoryItem) => {
    setChatToRename(chat);
    setNewTitle(chat.title);
    setIsRenameDialogOpen(true);
  };

  // 保存重命名
  const saveRename = () => {
    if (!chatToRename || !newTitle.trim()) return;
    
    const updatedHistory = chatHistory.map(chat => {
      if (chat.id === chatToRename.id) {
        return { ...chat, title: newTitle.trim() };
      }
      return chat;
    });
    
    setChatHistory(updatedHistory);
    localStorage.setItem("chat_history", JSON.stringify(updatedHistory));
    setIsRenameDialogOpen(false);
    toast.success("重命名成功");
  };

  // 删除聊天
  const handleDeleteChat = (chatId: string) => {
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    setChatHistory(updatedHistory);
    localStorage.setItem("chat_history", JSON.stringify(updatedHistory));
    
    // 如果删除的是当前活动的聊天，则清空消息
    if (chatId === activeChatId) {
      chatStore.setMessages([]);
      // 如果还有其他聊天，选择第一个
      if (updatedHistory.length > 0) {
        onSelectChat(updatedHistory[0].id);
      } else {
        // 否则创建新聊天
        onNewChat();
      }
    }
    
    toast.success("删除成功");
  };

  return (
    <>
      {/* 移动端侧边栏切换按钮 */}
      <div 
        className={cn(
          "fixed top-1/2 -translate-y-1/2 left-2 z-20 bg-white rounded-full shadow-md p-2 cursor-pointer transition-all duration-300 hover:bg-gray-100",
          isSidebarCollapsed ? "translate-x-0" : "translate-x-[260px]",
          "md:hidden"
        )}
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      >
        {isSidebarCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
      </div>
      
      {/* 桌面端侧边栏展开按钮（在侧边栏收起时显示） */}
      {isSidebarCollapsed && (
        <div 
          className={cn(
            "fixed top-[30%] -translate-y-1/2 left-2 z-20 bg-white rounded-full shadow-md p-2 cursor-pointer transition-all duration-300 hover:bg-gray-100",
            "hidden md:flex"
          )}
          onClick={() => setIsSidebarCollapsed(false)}
        >
          <ChevronRight size={24} />
        </div>
      )}
      
      <div 
        className={cn(
          "h-full flex flex-col bg-white text-gray-700 transition-all duration-300 ease-in-out z-10",
          isSidebarCollapsed ? "w-0 opacity-0 md:opacity-0 md:w-0" : "w-[260px]",
          "fixed md:relative left-0 top-0"
        )}
      >
        <div className="p-3 flex items-center justify-between">
          <Button
            onClick={onNewChat}
            className="flex-1 flex items-center justify-center rounded-md border border-gray-200 py-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100"
            variant="ghost"
          >
            <span className="text-[14px]">新建对话</span>
          </Button>
          
          {/* 桌面端侧边栏切换按钮 */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-2 hidden md:flex h-8 w-8 text-gray-500 hover:text-gray-700"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2">
          <div className="space-y-2">
          {chatHistory.length > 0 ? (
            chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group relative flex items-center rounded-md px-3 py-2 break-all hover:bg-gray-100 cursor-pointer transition-colors duration-200",
                  activeChatId === chat.id ? "bg-gray-100" : ""
                )}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('.chat-actions')) return;
                  onSelectChat(chat.id);
                }}
              >
                <div className="relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[14px]">{chat.title}</div>
                
                <div className="chat-actions absolute right-2 top-2 z-10 flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-500 hover:text-gray-700 p-0">
                        <MoreHorizontal size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white text-gray-700 border-gray-200">
                      <DropdownMenuItem 
                        onClick={() => handleRenameChat(chat)}
                        className="hover:bg-gray-100 focus:bg-gray-100 text-[14px] py-2"
                      >
                        <span>重命名</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteChat(chat.id)}
                        className="text-red-500 hover:bg-gray-100 focus:bg-gray-100 text-[14px] py-2"
                      >
                        <span>删除</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-[14px] text-gray-500 p-3 border border-gray-200 rounded-lg">
              暂无聊天历史
            </div>
          )}
          </div>
        </div>
      
      {/* 侧边栏收起时的遮罩层，点击可关闭侧边栏 */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 z-0 md:hidden" 
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}
    </div>
    </>
  );
}