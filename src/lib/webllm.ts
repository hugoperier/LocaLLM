import { CreateMLCEngine, MLCEngine, MLCEngineConfig, InitProgressReport } from "@mlc-ai/web-llm";
import { ChatMessage, SystemMessage } from "./types";

interface ModelInfo {
    id: string
    name: string
    description: string
    params: string
    size: string
    score: string
    avatar: string
}

export const AVAILABLE_MODELS: ModelInfo[] = [
    {
        id: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC',
        name: 'Mistral 7B Instruct',
        description: 'Modèle très performant pour le chat et le raisonnement. Excellent compromis qualité/taille.',
        params: '7B',
        size: '4.8GB',
        score: 'A+',
        avatar: '/avatar/01.png',
    },
    {
        id: 'phi-3.5-vision-q4f16',
        name: 'Phi-3.5 Vision (q4f16)',
        description: 'Modèle multimodal (texte + image) compact et rapide. Idéal pour l\'usage léger.',
        params: '3.8B',
        size: '4.0GB',
        score: 'A',
        avatar: '/avatar/02.png',
    },
    {
        id: 'Llama-3.2-3B-Instruct-q4f32_1-MLC',
        name: 'Llama 3.2 3B',
        description: "Meta's Llama 3.2 3B model, instruction-tuned",
        params: '3B',
        size: '4.8GB',
        score: 'A+',
        avatar: '/avatar/01.png',
    },
]


/*export const AVAILABLE_MODELS: ModelInfo[] = [
    {
        id: "Llama-3.2-3B-Instruct-q4f32_1-MLC",
        name: "Llama 3.2 3B",
        description: "Meta's Llama 3.2 3B model, instruction-tuned",
    },
];*/

class WebLLMService {
    private engine: MLCEngine | null = null;
    private isInitialized = false;
    private currentModel: string | null = null;
    private onTokenCallback: ((token: string) => void) | null = null;
    private onStatusCallback: ((status: InitProgressReport) => void) | null = null;
    private onInitializedCallback: ((isInitialized: boolean) => void) | null = null;
    private installedModels: string[] = [];

    constructor() {
        // Load installed models from localStorage on initialization
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('installedModels');
            if (stored) {
                this.installedModels = JSON.parse(stored);
            }
        }
    }

    getInstalledModels(): string[] {
        return this.installedModels;
    }

    isModelInstalled(modelId: string): boolean {
        return this.installedModels.includes(modelId);
    }

    private updateInstalledModels(models: string[]) {
        this.installedModels = models;
        if (typeof window !== 'undefined') {
            localStorage.setItem('installedModels', JSON.stringify(models));
        }
    }

    async installModel(modelId: string) {
        try {
            await this.loadModel(modelId);
            this.updateInstalledModels([...this.installedModels, modelId]);
            return true;
        } catch (error) {
            console.error(`Failed to install model ${modelId}:`, error);
            throw error;
        }
    }

    removeModel(modelId: string) {
        this.updateInstalledModels(this.installedModels.filter(id => id !== modelId));
    }

    setInitializedCallback(callback: (isInitialized: boolean) => void) {
        this.onInitializedCallback = callback;
    }

    setStatusCallback(callback: (status: InitProgressReport) => void) {
        this.onStatusCallback = callback;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // Get the first installed model, or null if none are installed
            const firstInstalledModel = this.installedModels[0] || null;

            if (firstInstalledModel) {
                this.engine = await CreateMLCEngine(firstInstalledModel, {
                    initProgressCallback: (status) => {
                        if (this.onStatusCallback) {
                            console.log("status", status);
                            this.onStatusCallback(status);
                        }
                    }
                });

                this.currentModel = firstInstalledModel;
                this.isInitialized = true;
                if (this.onInitializedCallback) {
                    this.onInitializedCallback(true);
                }
            } else {
                // No models installed, mark as initialized but without an engine
                this.isInitialized = true;
                if (this.onInitializedCallback) {
                    this.onInitializedCallback(false);
                }
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
            // If no engine exists, create one
            this.engine = await CreateMLCEngine(modelId, {
                initProgressCallback: (status) => {
                    if (this.onStatusCallback) {
                        console.log("status", status);
                        this.onStatusCallback(status);
                    }
                }
            });
        } else {
            // Notify that we're starting to load the model
            if (this.onStatusCallback) {
                this.onStatusCallback({ text: "Loading model...", progress: 0, timeElapsed: 0 });
            }

            await this.engine.reload(modelId);
        }
        
        this.currentModel = modelId;
        this.isInitialized = true;

        // Notify that loading is complete
        if (this.onStatusCallback) {
            this.onStatusCallback({ text: "Model loaded", progress: 1, timeElapsed: 0 });
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