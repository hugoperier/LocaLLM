import { CreateMLCEngine, MLCEngine, MLCEngineConfig, InitProgressReport } from "@mlc-ai/web-llm";
import { ChatMessage, SystemMessage } from "./types";

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

class WebLLMService {
    private engine: MLCEngine | null = null;
    private isInitialized = false;
    private currentModel: string | null = null;
    private onTokenCallback: ((token: string) => void) | null = null;
    private onStatusCallback: ((status: InitProgressReport) => void) | null = null;
    private onInitializedCallback: ((isInitialized: boolean) => void) | null = null;

    setInitializedCallback(callback: (isInitialized: boolean) => void) {
        this.onInitializedCallback = callback;
    }

    setStatusCallback(callback: (status: InitProgressReport) => void) {
        this.onStatusCallback = callback;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            const modelId = "Llama-3.2-3B-Instruct-q4f32_1-MLC";

            this.engine = await CreateMLCEngine('Llama-3.2-3B-Instruct-q4f32_1-MLC', {
                initProgressCallback: (status) => {
                    if (this.onStatusCallback) {
                        console.log("status", status);
                        this.onStatusCallback(status);
                    }
                }
            });

            this.currentModel = modelId;
            this.isInitialized = true;
            if (this.onInitializedCallback) {
                this.onInitializedCallback(true);
            }
        } catch (error) {
            console.error("Failed to initialize WebLLM:", error);
            if (this.onInitializedCallback) {
                this.onInitializedCallback(false);
            }
        }
    }

    async loadModel(modelId: string) {
        if (!this.engine) {
            throw new Error("WebLLM not initialized");
        }

        try {
            // Notify that we're starting to load the model
            if (this.onStatusCallback) {
                this.onStatusCallback({ text: "Loading model...", progress: 0, timeElapsed: 0 });
            }
            
            await this.engine.reload(modelId);
            this.currentModel = modelId;
            
            // Notify that loading is complete
            if (this.onStatusCallback) {
                this.onStatusCallback({ text: "Model loaded", progress: 1, timeElapsed: 0 });
            }
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
            const systemMessage: SystemMessage = {
                role: "system",
                content: "You are LocaLLM, a helpful and efficient AI assistant running locally. Your goal is to provide accurate, relevant, and concise answers. Always respond directly in the user's language.",
            };
              
            const allMessages = [systemMessage, ...messages];

            const response = await this.engine.chat.completions.create({
                messages: allMessages,
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

    cancelCurrentRequest() {
        this.engine?.interruptGenerate();
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