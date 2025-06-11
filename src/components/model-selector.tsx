import { AVAILABLE_MODELS, ModelInfo, webLLMService } from "@/lib/webllm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

interface ModelSelectorProps {
  onModelChange?: (modelId: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export function ModelSelector({ onModelChange, onLoadingChange }: ModelSelectorProps) {
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize WebLLM when component mounts
    webLLMService.initialize().catch(console.error);
    const model = webLLMService.getCurrentModel();
    setCurrentModel(model);
    if (model && onModelChange) {
      onModelChange(model);
    }
  }, [onModelChange]);

  const handleModelChange = async (modelId: string) => {
    setIsLoading(true);
    if (onLoadingChange) {
      onLoadingChange(true);
    }
    try {
      await webLLMService.loadModel(modelId);
      setCurrentModel(modelId);
      if (onModelChange) {
        onModelChange(modelId);
      }
    } catch (error) {
      console.error("Failed to load model:", error);
    } finally {
      setIsLoading(false);
      if (onLoadingChange) {
        onLoadingChange(false);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentModel || AVAILABLE_MODELS[0].id}
        onValueChange={handleModelChange}
        disabled={isLoading}
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