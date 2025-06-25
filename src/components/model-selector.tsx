import { AVAILABLE_MODELS, webLLMService } from "@/lib/webllm";
import { useWebLLM } from "@/contexts/WebLLMContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

export function ModelSelector() {
  const { isInitialized, currentModel, isModelLoading } = useWebLLM();
  // Force update when installed models change
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    // Patch: listen to storage events for installed models
    const handler = () => forceUpdate((n) => n + 1);
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handleModelChange = async (modelId: string) => {
    try {
      await webLLMService.loadModel(modelId);
      // The context will update currentModel and isModelLoading
      forceUpdate((n) => n + 1); // In case installed models changed
    } catch (error) {
      console.error("Failed to load model:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentModel || AVAILABLE_MODELS[0].id}
        onValueChange={handleModelChange}
        disabled={isModelLoading || !isInitialized}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_MODELS.map((model) => {
            const isInstalled = webLLMService.isModelInstalled(model.id);
            return (
              <SelectItem
                key={model.id}
                value={model.id}
                disabled={!isInstalled}
              >
                {model.name}
                {!isInstalled && (
                  <span className="text-xs text-muted-foreground ml-2">(not installed)</span>
                )}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {isModelLoading && (
        <div className="text-sm text-muted-foreground">Loading...</div>
      )}
    </div>
  );
} 