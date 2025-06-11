import Link from "next/link";
import Image from "next/image";
import { ModelSelector } from "@/components/model-selector";
import { useWebLLM } from "@/contexts/WebLLMContext";

export function ChatHeader() {
  const { isInitialized, currentModel, isModelLoading } = useWebLLM();

  return (
    <div>
      <div className="bg-white h-10 flex gap-3 items-center px-3">
        <div>
          <Link href="/">
            <Image src="/images/image.png" alt="LocaLLM" width={130} height={32} />
          </Link>
        </div>
        <div className="flex-1"></div>
        <ModelSelector />
      </div>
    </div>
  );
} 