import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage } from "./ChatMessage";
import { useRef, useEffect } from "react";
import { ChatMessage as ChatMessageType } from "@/lib/types";

interface ChatMessagesProps {
  conversation: ChatMessageType[];
  isGenerating: boolean;
  currentResponse: string;
  onEditMessage?: (index: number, content: string) => void;
}

export function ChatMessages({
  conversation,
  isGenerating,
  currentResponse,
  onEditMessage,
}: ChatMessagesProps) {
  const scrollRef = useRef<null | HTMLDivElement>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (conversation.length > 0) {
      const messageEndPosition =
        messagesEndRef.current?.getBoundingClientRect()?.top || 0;
      const scrollAreaPosition =
        scrollRef.current?.getBoundingClientRect()?.top || 0;
      const scrollAreaHeight = scrollRef.current?.clientHeight || 0;
      const scrollPosition = messageEndPosition - scrollAreaPosition;
      if (scrollAreaHeight - scrollPosition >= -200) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [conversation]);

  return (
    <ScrollArea ref={scrollRef} className="flex-1 overflow-x-hidden">
      <div className="flex flex-col gap-1 p-2 max-w-3xl mx-auto">
        {conversation.map((msg, i) => (
          <ChatMessage
            key={i}
            message={msg}
            showAvatar={
              i === 0 ||
              conversation[i - 1].role !== msg.role
            }
            onEdit={
              onEditMessage && msg.role === "user"
                ? (content) => onEditMessage(i, content)
                : undefined
            }
          />
        ))}
        {isGenerating && currentResponse && (
          <div className="flex gap-2">
            <Avatar className={`w-6 h-6 bg-gray-200`}>
              <AvatarImage src="avatar/02.png" />
              <AvatarFallback>.ˍ.</AvatarFallback>
            </Avatar>
            <div className="max-w-[60%] flex flex-col bg-white mr-auto items-start gap-2 rounded-lg border p-2 text-left text-sm transition-all whitespace-pre-wrap">
              {currentResponse}
            </div>
          </div>
        )}
      </div>
      <div ref={messagesEndRef} className="mb-2"></div>
    </ScrollArea>
  );
} 