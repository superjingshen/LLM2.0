import { Button } from "../ui/button";
import { PlusIcon, Pencil, Trash2, MoreHorizontal, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { cn } from "~/lib/utils";
import { MessageIcon } from "../ui/icons";
import { useChatStore } from "~/store/index";
import { MessageInter } from "~/types";
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
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);
  
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
    
    const handleChatHistoryUpdate = (event: CustomEvent<{updatedHistory: any, activeChatId?: string}>) => {
      const { updatedHistory, activeChatId: eventActiveChatId } = event.detail;
      
      // 将日期字符串转换为Date对象
      const formattedHistory = updatedHistory.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));
      
      // 只有当历史记录确实发生变化时才更新状态
      if (JSON.stringify(chatHistory) !== JSON.stringify(formattedHistory)) {
        setChatHistory(formattedHistory);
      }
      
      // 如果提供了activeChatId，且与当前选中的不同，则选中该对话
      if (eventActiveChatId && eventActiveChatId !== activeChatId) {
        onSelectChat(eventActiveChatId);
      }
    };
    
    window.addEventListener('chatHistoryUpdate', handleChatHistoryUpdate as EventListener);
    return () => {
      window.removeEventListener('chatHistoryUpdate', handleChatHistoryUpdate as EventListener);
    };
  }, [onSelectChat, chatHistory, activeChatId]);

  // 重命名聊天 - 对话框方式
  const handleRenameChat = (chat: ChatHistoryItem) => {
    setChatToRename(chat);
    setNewTitle(chat.title);
    setIsRenameDialogOpen(true);
  };

  // 开始内联编辑
  const startInlineEdit = (chat: ChatHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
    // 使用setTimeout确保在DOM更新后聚焦
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
        editInputRef.current.select();
      }
    }, 0);
  };

  // 取消内联编辑
  const cancelInlineEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingChatId(null);
  };

  // 保存内联编辑
  const saveInlineEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!editingChatId || !editingTitle.trim()) {
      cancelInlineEdit();
      return;
    }
    
    const updatedHistory = chatHistory.map(chat => {
      if (chat.id === editingChatId) {
        return { ...chat, title: editingTitle.trim() };
      }
      return chat;
    });
    
    setChatHistory(updatedHistory);
    localStorage.setItem("chat_history", JSON.stringify(updatedHistory));
    
    // 触发自定义事件通知其他组件聊天历史已更新
    window.dispatchEvent(new CustomEvent('chatHistoryUpdate', { 
      detail: { updatedHistory }
    }));
    
    setEditingChatId(null);
    toast.success("重命名成功");
  };

  // 处理内联编辑的键盘事件
  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveInlineEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelInlineEdit();
    }
  };

  // 保存重命名 - 对话框方式
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
    
    // 触发自定义事件通知其他组件聊天历史已更新
    window.dispatchEvent(new CustomEvent('chatHistoryUpdate', { 
      detail: { updatedHistory }
    }));
    
    setIsRenameDialogOpen(false);
    toast.success("重命名成功");
  };

  // 删除聊天
  const handleDeleteChat = (chatId: string) => {
    // 从历史记录中过滤掉要删除的聊天
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    setChatHistory(updatedHistory);
    localStorage.setItem("chat_history", JSON.stringify(updatedHistory));
    
    // 清除store中的所有消息数据 - 只保留一个状态更新方法调用
    chatStore.clearChatData();
    // 移除这两行，因为clearChatData已经包含了这些功能
    // chatStore.setMessages([]);
    // chatStore.setMessagesInline([]);
    
    // 触发自定义事件通知其他组件聊天历史已更新
    // 不提供activeChatId，表示这是一个删除操作
    window.dispatchEvent(new CustomEvent('chatHistoryUpdate', { 
      detail: { updatedHistory }
    }));
    
    // 如果还有其他聊天，选择第一个
    if (updatedHistory.length > 0) {
      onSelectChat(updatedHistory[0].id);
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
                  activeChatId === chat.id ? "bg-gray-100" : "",
                  editingChatId === chat.id ? "bg-gray-100" : ""
                )}
                onClick={(e) => {
                  if (editingChatId === chat.id || (e.target as HTMLElement).closest('.chat-actions')) return;
                  onSelectChat(chat.id);
                }}
              >
                {editingChatId === chat.id ? (
                  <div className="flex items-center w-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      className="flex-1 bg-transparent border-none focus:outline-none text-[14px] p-0"
                      autoFocus
                    />
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-green-500 hover:text-green-600 p-1"
                        onClick={saveInlineEdit}
                      >
                        <Check size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-red-500 hover:text-red-600 p-1"
                        onClick={cancelInlineEdit}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[14px]">{chat.title}</div>
                    
                    <div className="chat-actions absolute right-2 top-2 z-10 flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 text-gray-500 hover:text-gray-700 p-0 mr-1"
                        onClick={(e) => startInlineEdit(chat, e)}
                      >
                        <Pencil size={14} />
                      </Button>
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
                            <Pencil className="mr-2" size={14} />
                            <span>重命名</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteChat(chat.id)}
                            className="text-red-500 hover:bg-gray-100 focus:bg-gray-100 text-[14px] py-2"
                          >
                            <Trash2 className="mr-2" size={14} />
                            <span>删除</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
                )}
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
    
    {/* 重命名对话框 */}
    <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">重命名对话</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="输入新的对话名称"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && saveRename()}
            autoFocus
          />
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsRenameDialogOpen(false)}
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={saveRename}
            disabled={!newTitle.trim()}
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}