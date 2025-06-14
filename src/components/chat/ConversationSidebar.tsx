import { Button } from "@/components/ui/button";
import { Conversation } from "@/hooks/useConversations";

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onSelect: (id: string) => void;
}

export function ConversationSidebar({
  conversations,
  selectedConversation,
  onAdd,
  onDelete,
  onClear,
  onSelect,
}: ConversationSidebarProps) {
  return (
    <aside className="w-64 border-r flex flex-col">
      <div className="p-2 flex gap-2 border-b">
        <Button className="flex-1" onClick={onAdd}>
          + Nouvelle conversation
        </Button>
        <Button variant="destructive" onClick={onClear}>
          🗑️
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-muted ${
              selectedConversation?.id === conv.id ? "bg-muted" : ""
            }`}
          >
            <span className="text-sm truncate">
              {conv.title}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conv.id);
              }}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>
    </aside>
  );
} 