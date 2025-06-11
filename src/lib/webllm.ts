import { CreateMLCEngine, MLCEngine, MLCEngineConfig } from "@mlc-ai/web-llm";

export interface ModelInfo {
    id: string;
    name: string;
    description: string;
}

export const AVAILABLE_MODELS: ModelInfo[] = [
    {
        id: "Llama-3.2-3B-Instruct-q4f32_1-MLC",
        name: "Llama 3.2 3B",
        description: "Meta's Llama 3.2 3B model, instruction-tuned",
    },
];

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

class WebLLMService {
    private engine: MLCEngine | null = null;
    private isInitialized = false;
    private currentModel: string | null = null;
    private onTokenCallback: ((token: string) => void) | null = null;

    async initialize() {
        if (this.isInitialized) return;

        try {
            const modelId = "Llama-3.2-3B-Instruct-q4f32_1-MLC";

            this.engine = await CreateMLCEngine('Llama-3.2-3B-Instruct-q4f32_1-MLC', {
                initProgressCallback: (status) => console.log(`Loading model ${status.text} ${status.progress }% `)
            });

            this.currentModel = modelId;
            this.isInitialized = true;
        } catch (error) {
            console.error("Failed to initialize WebLLM:", error);
            throw error;
        }
    }

    async loadModel(modelId: string) {
        if (!this.engine) {
            throw new Error("WebLLM not initialized");
        }

        try {
            await this.engine.reload(modelId);
            this.currentModel = modelId;
        } catch (error) {
            console.error(`Failed to load model ${modelId}:`, error);
            throw error;
        }
    }

    setOnTokenCallback(callback: (token: string) => void) {
        this.onTokenCallback = callback;
    }

    async generateResponse(messages: ChatMessage[]): Promise<string> {
        if (!this.engine) {
            throw new Error("WebLLM not initialized");
        }

        try {
            const response = await this.engine.chat.completions.create({
                messages,
                stream: true,
            });

            let fullResponse = '';
            for await (const chunk of response) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (this.onTokenCallback) {
                    this.onTokenCallback(content);
                }
                fullResponse += content;
            }
            return fullResponse;
        } catch (error) {
            console.error("Failed to generate response:", error);
            throw error;
        }
    }

    getCurrentModel(): string | null {
        return this.currentModel;
    }

    isReady(): boolean {
        return this.isInitialized && this.engine !== null;
    }
}

// Export a singleton instance
export const webLLMService = new WebLLMService(); 