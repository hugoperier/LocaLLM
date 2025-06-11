import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModelSelector } from "@/components/model-selector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatHeaderProps {
  onModelChange?: (modelId: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export function ChatHeader({ onModelChange, onLoadingChange }: ChatHeaderProps) {
  return (
    <div>
      <div className="bg-white h-10 flex gap-3 items-center px-3">
        <div>
          <Link href="/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M21 3l-5 9h5l-6.891 7.086a6.5 6.5 0 1 1 -8.855 -9.506l7.746 -6.58l-1 5l9 -5z" />
              <path d="M9.5 14.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0" />
            </svg>
          </Link>
        </div>
        <div className="flex-1"></div>
        <ModelSelector onModelChange={onModelChange} onLoadingChange={onLoadingChange} />
      </div>
    </div>
  );
} 