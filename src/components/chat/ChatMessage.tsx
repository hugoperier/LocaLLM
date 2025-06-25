import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import { useState, useRef, useEffect } from "react";
import { AutosizeTextarea, AutosizeTextAreaRef } from "@/components/ui/autosize-textarea";
import { Pencil, Check, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: ChatMessageType;
  showAvatar: boolean;
  onEdit?: (content: string) => void;
}
export function ChatMessage({ message, showAvatar, onEdit }: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(message.content);
  const inputRef = useRef<AutosizeTextAreaRef | null>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.textArea.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (onEdit) {
      onEdit(value);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex gap-2 first:mt-2 group">
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
        className={`relative max-w-[60%] flex flex-col ${
          message.role === "assistant" || message.role === "system"
            ? "bg-white mr-auto"
            : "text-white bg-black ml-auto"
        } items-start gap-2 rounded-lg border p-2 text-left text-sm transition-all whitespace-pre-wrap`}
      >
        {isEditing ? (
          <>
            <AutosizeTextarea
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              minHeight={25}
              maxHeight={200}
              className="w-full outline-none border-0 bg-transparent"
            />
            <div className="flex justify-end gap-1 w-full mt-1">
              <button
                className="p-1 text-primary hover:text-primary/80"
                aria-label="Valider"
                onClick={handleSave}
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                className="p-1 text-muted-foreground hover:text-muted-foreground/80"
                aria-label="Annuler"
                onClick={() => {
                  setIsEditing(false);
                  setValue(message.content);
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <>
            {message.role === "assistant" ? (
              <div className="prose prose-sm max-w-none prose-blue prose-pre:bg-gray-100 prose-pre:rounded-md prose-pre:p-2 prose-code:bg-gray-100 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-blockquote:border-l-4 prose-blockquote:border-blue-200 prose-blockquote:bg-blue-50 prose-blockquote:px-3 prose-blockquote:py-1 prose-li:marker:text-blue-400 prose-a:text-blue-600 hover:prose-a:underline prose-strong:font-semibold prose-em:italic prose-table:border prose-table:border-gray-200 prose-th:bg-gray-100 prose-th:font-semibold prose-th:p-2 prose-td:p-2 prose-img:rounded-md prose-img:shadow-sm prose-img:border overflow-x-auto w-full">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: (props) => (
                      <a {...props} target="_blank" rel="noopener noreferrer">
                        {props.children}
                      </a>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <>
                {message.content}
                {"edited" in message && message.edited && (
                  <span className="ml-1 text-xs text-muted-foreground">(Édité)</span>
                )}
                {onEdit && message.role === "user" && (
                  <button
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-muted-foreground"
                    aria-label="Éditer le message"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </>
            )}
          </>
        )}
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