import { useChatStore } from "~/store/index";
import { useEffect, useRef, useState } from "react";
import { ChatContentType, MessageInter } from "~/types";
import Markdown from "~/components/markdown";
import FileCard from "~/components/chat/FileCard";
import { CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import pkg from "react-copy-to-clipboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { MdSkeleton, SuggestionSkeleton } from "~/components/chat/ChatSkeleton";
const { CopyToClipboard } = pkg;

export default function ChatContent({ type }: ChatContentType) {
  const store = useChatStore();
  const [messages, setMessages] = useState<MessageInter[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (type === "inline") {
      setMessages(store.messages_inline);
    } else {
      setMessages(store.messages);
    }
  }, [store.messages, store.messages_inline, type]);

  // 监听chatHistoryUpdate事件，处理对话删除
  useEffect(() => {
    const handleChatHistoryUpdate = (event: CustomEvent<{updatedHistory: any, activeChatId?: string}>) => {
      // 当有对话被删除时，无论是否还有其他对话，都需要更新消息显示
      // 如果提供了activeChatId，说明是选中了新对话或创建了新对话
      // 如果没有提供activeChatId，说明是删除了对话，需要清空当前消息
      if (!event.detail.activeChatId) {
        // 直接更新本地状态，而不是调用store方法
        setMessages([]);
      }
    };
    
    window.addEventListener('chatHistoryUpdate', handleChatHistoryUpdate as EventListener);
    return () => {
      window.removeEventListener('chatHistoryUpdate', handleChatHistoryUpdate as EventListener);
    };
  }, []);
  
  // 确保在组件挂载时检查是否有聊天历史，如果没有则清空消息
  useEffect(() => {
    const chatHistory = localStorage.getItem("chat_history");
    if (!chatHistory || JSON.parse(chatHistory).length === 0) {
      setMessages([]);
      // 只有当store中有消息时才清空，避免不必要的状态更新
      if (type === "inline" && store.messages_inline.length > 0) {
        store.setMessagesInline([]);
      } else if (type === "page" && store.messages.length > 0) {
        store.setMessages([]);
      }
    }
  }, [store, type]);


  useEffect(() => {
    const distance =
      window.innerHeight - (scrollRef.current?.scrollHeight || 0) - 100;
    if (timer.current || distance > 0) return;
    timer.current = setTimeout(() => {
      ScrollToBottom();
      clearTimeout(timer.current as NodeJS.Timeout);
      timer.current = null;
    }, 800);
  }, [messages]);

  const ScrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };
  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 1000);
    }
  }, [copied]);

  const sendMessage = (v: string) => {
    if (type === "inline") {
      store.setSendMessageFlagInline(v);
    } else {
      store.setSendMessageFlag(v);
    }
  };
  return (
    <div
      ref={scrollRef}
      className={cn("overflow-y-auto flex-1 px-4 md:px-8 lg:px-16 w-full", type === "inline" && "h-[400px]")}
    >
      {messages.map((item, index) => (
        <div className="my-3" key={index}>
          {item.role === "assistant" && (
            <div className="max-w-3xl">
              {!item.error ? (
                item.text ? (
                  <div className="group">
                    <Markdown>{item.text}</Markdown>
                    <div className="w-full hidden justify-end group-hover:flex">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <CopyToClipboard
                              text={item.text}
                              onCopy={() => setCopied(true)}
                            >
                              <div className="flex flex-row items-center gap-2 cursor-pointer w-fit ml-1">
                                {copied ? (
                                  <CheckIcon width={20} />
                                ) : (
                                  <ClipboardDocumentIcon width={20} />
                                )}
                              </div>
                            </CopyToClipboard>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="min-h-[20px] block group-hover:hidden"></div>
                  </div>
                ) : (
                  <MdSkeleton />
                )
              ) : (
                <p className="text-red-500 break-words">{item.error}</p>
              )}
              {index == messages.length - 1 &&
                item.suggestions &&
                (item.suggestions?.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {item.suggestions.map((item, index) => (
                      <div key={index}>
                        <button
                          onClick={() => sendMessage(item)}
                          className="text-blue-400 hover:text-blue-500 cursor-pointer"
                        >
                          {item}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <SuggestionSkeleton />
                ))}
            </div>
          )}
          {item.role === "user" && (
            <div className="flex flex-row-reverse gap-4 max-w-2xl lg:max-w-3xl mx-auto lg:ml-auto lg:mr-8">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21C20 18.2386 16.4183 16 12 16C7.58172 16 4 18.2386 4 21" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8C17 10.7614 14.7614 13 12 13Z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="flex flex-col gap-2 flex-1 items-end">
                {item.images && item.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 justify-end">
                    {item.images?.map((fileItem, fileIndex) => (
                      <img
                        src={fileItem.base64}
                        className="w-[200px] h-[200px] rounded-xl "
                        key={fileIndex}
                        alt={fileItem.name}
                      />
                    ))}
                  </div>
                )}
                {item.files && item.files.length > 0 && (
                  <div className="flex flex-wrap gap-3 justify-end">
                    {item.files?.map((fileItem, fileIndex) => (
                      <FileCard
                        key={fileIndex}
                        file={fileItem}
                      />
                    ))}
                  </div>
                )}
                <div className="bg-secondary px-4 py-2 rounded-xl">
                  <pre className="whitespace-pre-wrap break-words text-right">{item.text}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
