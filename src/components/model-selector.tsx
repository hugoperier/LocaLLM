import { AVAILABLE_MODELS, webLLMService } from "@/lib/webllm";
import { useWebLLM } from "@/contexts/WebLLMContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function ModelSelector() {
  const { isInitialized, currentModel } = useWebLLM();
  const [isLoading, setIsLoading] = useState(false);

  const handleModelChange = async (modelId: string) => {
    setIsLoading(true);
    try {
      await webLLMService.loadModel(modelId);
    } catch (error) {
      console.error("Failed to load model:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentModel || AVAILABLE_MODELS[0].id}
        onValueChange={handleModelChange}
        disabled={isLoading || !isInitialized}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isLoading && (
        <div className="text-sm text-muted-foreground">Loading...</div>
      )}
    </div>
  );
} 