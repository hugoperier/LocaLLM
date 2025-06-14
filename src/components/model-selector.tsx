import { AVAILABLE_MODELS, webLLMService } from "@/lib/webllm";
import { useWebLLM } from "@/contexts/WebLLMContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ModelSelector() {
  const { isInitialized, currentModel, isModelLoading } = useWebLLM();

  const handleModelChange = async (modelId: string) => {
    try {
      await webLLMService.loadModel(modelId);
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
      {isModelLoading && (
        <div className="text-sm text-muted-foreground">Loading...</div>
      )}
    </div>
  );
} 