import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import { useState, useRef, useEffect } from "react";
import { AutosizeTextarea, AutosizeTextAreaRef } from "@/components/ui/autosize-textarea";
import { Pencil, Check, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";
import { createPortal } from "react-dom";

interface ChatMessageProps {
  message: ChatMessageType;
  showAvatar: boolean;
  onEdit?: (content: string) => void;
}

export function ChatMessage({ message, showAvatar, onEdit }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(message.content);
  const inputRef = useRef<AutosizeTextAreaRef | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isEditing) inputRef.current?.textArea.focus();
  }, [isEditing]);

  // Gestion des raccourcis clavier pour l'édition
  useEffect(() => {
    if (!isEditing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditing(false);
        setValue(message.content);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        save();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, value]);

  const save = () => {
    onEdit?.(value);
    setIsEditing(false);
  };

  const bubble = clsx(
    "relative max-w-[60%] flex flex-col rounded-xl border p-3 text-sm whitespace-pre-wrap transition-colors group",
    {
      "ml-auto bg-slate-900 text-slate-100 border-slate-700": isUser,
      "mr-auto bg-white text-slate-900 border-slate-200": !isUser,
    },
  );

  const btn =
    "inline-flex items-center justify-center rounded-md p-1 hover:bg-slate-700/10 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition";

  // Overlay d'édition
  const editOverlay = mounted && isEditing
    ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-[90vw] max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border border-slate-200 dark:border-slate-700 animate-fade-in">
            <AutosizeTextarea
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              minHeight={60}
              maxHeight={300}
              className="w-full outline-none border-0 bg-transparent resize-none text-base font-medium"
              placeholder="Modifier votre message..."
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-2">
              <button
                className={clsx(btn, "text-primary bg-primary/10 hover:bg-primary/20 font-semibold px-4 py-2 rounded-lg")}
                aria-label="Valider"
                onClick={save}
              >
                <Check className="w-5 h-5 mr-1" /> Valider
              </button>
              <button
                className={clsx(btn, "text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 rounded-lg")}
                aria-label="Annuler"
                onClick={() => {
                  setIsEditing(false);
                  setValue(message.content);
                }}
              >
                <X className="w-5 h-5 mr-1" /> Annuler
              </button>
            </div>
            <span className="absolute top-2 right-4 text-xs text-slate-400 select-none">Echap pour annuler, Ctrl+Entrée pour valider</span>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {editOverlay}
      <div className={clsx("flex gap-2 first:mt-2", isEditing && "pointer-events-none blur-sm select-none")}>
        {!isUser && showAvatar && (
          <Avatar className="w-6 h-6 bg-gray-200">
            <AvatarImage src="avatar/02.png" />
            <AvatarFallback>.ˍ.</AvatarFallback>
          </Avatar>
        )}

        <div className={bubble}>
          {onEdit && isUser && !isEditing && (
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100">
              <button
                className={clsx(btn, "text-slate-400 hover:text-slate-100")}
                aria-label="Éditer"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}

          {isEditing ? null : message.role === "assistant" ? (
            <div className="prose prose-sm max-w-none w-full prose-blue dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: (props) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-2 hover:underline"
                    >
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
                <span className="ml-1 text-xs text-slate-400">(Édité)</span>
              )}
            </>
          )}
        </div>

        {isUser && showAvatar && (
          <Avatar className="w-6 h-6 bg-gray-200">
            <AvatarImage src="avatar/01.png" />
            <AvatarFallback>.ˍ.</AvatarFallback>
          </Avatar>
        )}
      </div>
    </>
  );
}