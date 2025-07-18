import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/hooks/useConversations";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SearchModal } from "./SearchModal";
import { ModelSelectorModal } from "./ModelSelectorModal";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Placeholder SVG icons (à remplacer par Lucide/Heroicons ou autre lib)
const IconSplit = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="18" rx="2"/><rect x="14" y="3" width="7" height="18" rx="2"/></svg>
);
const IconSearch = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const IconAdd = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const IconMore = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
);

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onSelect: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void; // Optionnel pour rename
}

export function ConversationSidebar({
  conversations,
  selectedConversation,
  onAdd,
  onDelete,
  onClear,
  onSelect,
  onRename,
}: ConversationSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);

  // Tri par date de dernière activité (timestamp)
  const sortedConversations = [...conversations].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <>
      <aside
        className={`transition-all duration-300 border-r flex flex-col bg-white h-full shadow-lg ${collapsed ? "w-20" : "w-80"}`}
        style={{ minWidth: collapsed ? 64 : 320 }}
      >
        {/* Logo + split view */}
        <div className="flex items-center justify-between px-4 py-4 border-b min-h-[64px]">
          <div className="flex items-center">
            {!collapsed && (
              <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded" />
            )}
          </div>
          <button
            className="p-2 rounded hover:bg-muted transition"
            aria-label="Replier le menu"
            onClick={() => setCollapsed((c) => !c)}
          >
            <IconSplit />
          </button>
        </div>
        {/* Actions principales */}
        {!collapsed && (
          <div className="flex flex-col gap-3 px-4 pt-6 pb-2">
            <button
              className="flex items-center gap-2 justify-center w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-base shadow hover:bg-primary/90 transition"
              onClick={onAdd}
            >
              <IconAdd /> Nouvelle conversation
            </button>
            <button
              className="flex items-center gap-2 justify-center w-full py-3 rounded-lg bg-muted text-foreground font-medium text-base hover:bg-accent transition"
              onClick={() => setIsSearchOpen(true)}
            >
              <IconSearch /> Rechercher un chat
            </button>
          </div>
        )}
        {/* Titre section chats */}
        {!collapsed && (
          <div className="px-4 pt-4 pb-2">
            <span className="text-xl font-bold tracking-tight">Chats</span>
          </div>
        )}
        {/* Liste des chats */}
        <div className={`flex-1 overflow-auto ${collapsed ? "pt-4" : "pt-2"} px-1`}>
          {sortedConversations.length === 0 && !collapsed && (
            <div className="text-muted-foreground text-center mt-8">Aucune conversation</div>
          )}
          {sortedConversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-2 rounded-lg px-2 py-2 mb-1 cursor-pointer transition-colors ${selectedConversation?.id === conv.id ? "bg-accent" : "hover:bg-muted"} ${collapsed ? "justify-center" : "justify-between"}`}
              onClick={() => onSelect(conv.id)}
              tabIndex={0}
            >
              {collapsed ? (
                <span className="w-8 h-8 flex items-center justify-center bg-muted rounded-full text-lg font-bold uppercase">
                  {conv.title?.[0] || "C"}
                </span>
              ) : (
                <>
                  {renamingId === conv.id ? (
                    <input
                      className="flex-1 bg-transparent border-b border-primary outline-none text-base px-1 py-0.5"
                      value={renameValue}
                      autoFocus
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={() => {
                        setRenamingId(null);
                        setRenameValue("");
                      }}
                      onKeyDown={e => {
                        if (e.key === "Enter" && renameValue.trim() && onRename) {
                          onRename(conv.id, renameValue.trim());
                          setRenamingId(null);
                          setRenameValue("");
                        } else if (e.key === "Escape") {
                          setRenamingId(null);
                          setRenameValue("");
                        }
                      }}
                    />
                  ) : (
                    <span className="flex-1 truncate text-base font-medium">
                      {conv.title}
                    </span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-1 rounded hover:bg-accent/40 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label="Plus d'actions"
                        onClick={e => e.stopPropagation()}
                      >
                        <IconMore />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setRenamingId(conv.id);
                          setRenameValue(conv.title || "");
                        }}
                      >Renommer</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(conv.id)}
                        className="text-destructive"
                      >Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          ))}
        </div>
        {/* Footer (supprimer tous les chats) */}
        {!collapsed && (
          <div className="p-3 border-t flex justify-between gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsModelModalOpen(true)}>
              Gérer les modèles
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setIsClearConfirmOpen(true)}>
              Supprimer tous les chats
            </Button>
          </div>
        )}
      </aside>
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        conversations={conversations}
        onSelect={onSelect}
      />
      <ModelSelectorModal isOpen={isModelModalOpen} onOpenChange={setIsModelModalOpen} />
      <Dialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
        <DialogContent>
          <DialogTitle>Vider tous les chats</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer toutes vos conversations ? Cette action est irréversible.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClearConfirmOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onClear();
                setIsClearConfirmOpen(false);
              }}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 