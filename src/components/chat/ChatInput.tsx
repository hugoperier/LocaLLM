import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus } from "lucide-react";
import { KeyboardEvent } from "react";
import { useWebLLM } from "@/contexts/WebLLMContext";
import { webLLMService } from "@/lib/webllm";

interface ChatInputProps {
  userInput: string;
  setUserInput: (input: string) => void;
  sendMessage: () => void;
  isGenerating: boolean;
  isInitialized: boolean;
}

export function ChatInput({
  userInput,
  setUserInput,
  sendMessage,
  isGenerating,
  isInitialized,
}: ChatInputProps) {
  const { currentModel, isModelLoading, status } = useWebLLM();

  const handleEnter = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const stopMessage = () => {
    webLLMService.cancelCurrentRequest();
  };

  const parseLoadingProgress = (message: string) => {
    const match = message.match(/\[(\d+)\/(\d+)\]/);
    if (match) {
      const current = parseInt(match[1]);
      const total = parseInt(match[2]);
      return { current, total, percentage: (current / total) * 100 };
    }
    return null;
  };

  const progress = status?.text ? parseLoadingProgress(status.text) : null;
  return (
    <div className="w-full sm:max-w-3xl mx-auto">
      <div className="bg-white sm:rounded-t-md border-t sm:border shadow-lg">
        <div className="p-4">
          <div className="flex flex-row gap-3 p-4 border rounded-t-md">
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <div className="h-8 w-8 p-0 rounded-full shadow-sm border flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" alignOffset={-10}>
                  <DropdownMenuLabel>More options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Reset</DropdownMenuItem>
                  <DropdownMenuItem>
                    Attach <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <AutosizeTextarea
              className="flex-1 outline-none border-0"
              placeholder="Type here ..."
              minHeight={25}
              maxHeight={400}
              onKeyDown={(e) => handleEnter(e)}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isGenerating}
            />
            <Button
              onClick={isGenerating ? stopMessage : sendMessage}
              className="h-8 w-8 p-0"
              disabled={!isInitialized}
            >
              {!isInitialized ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isGenerating ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M200 32v144a8 8 0 0 1-8 8H67.31l34.35 34.34a8 8 0 0 1-11.32 11.32l-48-48a8 8 0 0 1 0-11.32l48-48a8 8 0 0 1 11.32 11.32L67.31 168H184V32a8 8 0 0 1 16 0Z"></path>
                </svg>
              )}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2 px-4">
            {isModelLoading ? (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Loading model...</span>
                  {progress && (
                    <span className="text-muted-foreground">
                      {progress.current}/{progress.total}
                    </span>
                  )}
                </div>
                {progress && (
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 ease-in-out"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                )}
              </div>
            ) : currentModel ? (
              <span>Using model: {currentModel}</span>
            ) : (
              <span>No model selected</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 