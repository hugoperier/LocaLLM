import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage as ChatMessageType } from "@/lib/types";

interface ChatMessageProps {
  message: ChatMessageType;
  showAvatar: boolean;
}

export function ChatMessage({ message, showAvatar }: ChatMessageProps) {
  return (
    <div className="flex gap-2 first:mt-2">
      {message.role === "assistant" && (
        <>
          {!showAvatar ? (
            <div className={`w-6 h-6`}></div>
          ) : (
            <Avatar className={`w-6 h-6 bg-gray-200`}>
              <AvatarImage src="avatar/02.png" />
              <AvatarFallback>.ˍ.</AvatarFallback>
            </Avatar>
          )}
        </>
      )}
      <div
        className={`max-w-[60%] flex flex-col ${
          (message.role === "assistant" || message.role === "system")
            ? "bg-white mr-auto"
            : "text-white bg-black ml-auto"
        } items-start gap-2 rounded-lg border p-2 text-left text-sm transition-all whitespace-pre-wrap`}
      >
        {message.content}
      </div>
      {message.role === "user" && (
        <>
          {!showAvatar ? (
            <div className={`w-6 h-6`}></div>
          ) : (
            <Avatar className={`w-6 h-6 bg-gray-200`}>
              <AvatarImage src="avatar/01.png" />
              <AvatarFallback>.ˍ.</AvatarFallback>
            </Avatar>
          )}
        </>
      )}
    </div>
  );
} 