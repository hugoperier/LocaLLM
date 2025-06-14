import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Conversation } from "@/hooks/useConversations";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader2 } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  onSelect: (id: string) => void;
}

interface SearchResult {
  conversationId: string;
  title: string;
  messagePreview: string;
  matchType: "title" | "message";
}

export function SearchModal({ isOpen, onClose, conversations, onSelect }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const searchConversations = useCallback((query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const searchResults: SearchResult[] = [];

    conversations.forEach((conv) => {
      // Recherche dans le titre
      if (conv.title.toLowerCase().includes(query.toLowerCase())) {
        searchResults.push({
          conversationId: conv.id,
          title: conv.title,
          messagePreview: "",
          matchType: "title",
        });
      }

      // Recherche dans les messages
      conv.messages?.forEach((msg) => {
        if (msg.content.toLowerCase().includes(query.toLowerCase())) {
          searchResults.push({
            conversationId: conv.id,
            title: conv.title,
            messagePreview: msg.content.slice(0, 100) + (msg.content.length > 100 ? "..." : ""),
            matchType: "message",
          });
        }
      });
    });

    // Dédupliquer les résultats (si une conversation a plusieurs matches)
    const uniqueResults = Array.from(
      new Map(searchResults.map((item) => [item.conversationId, item])).values()
    );

    setResults(uniqueResults);
    setIsSearching(false);
  }, [conversations]);

  useEffect(() => {
    searchConversations(debouncedSearch);
  }, [debouncedSearch, searchConversations]);

  const handleSelect = (conversationId: string) => {
    onSelect(conversationId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0" hideCloseButton>
        <DialogTitle className="sr-only">Rechercher dans les conversations</DialogTitle>
        <div className="p-4 border-b">
          <Input
            type="search"
            placeholder="Rechercher dans les conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            autoFocus
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : searchQuery && results.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Aucun résultat trouvé pour "{searchQuery}"
            </div>
          ) : !searchQuery ? (
            <div className="p-8 text-center text-muted-foreground">
              Commencez à taper pour rechercher dans vos conversations
            </div>
          ) : (
            <div className="divide-y">
              {results.map((result) => (
                <button
                  key={result.conversationId}
                  className="w-full p-4 text-left hover:bg-muted transition-colors"
                  onClick={() => handleSelect(result.conversationId)}
                >
                  <div className="font-medium">{result.title}</div>
                  {result.messagePreview && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {result.messagePreview}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {result.matchType === "title" ? "Match dans le titre" : "Match dans un message"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 