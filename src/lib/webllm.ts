import { CreateMLCEngine, MLCEngine, MLCEngineConfig, InitProgressReport } from "@mlc-ai/web-llm";
import { ChatMessage, SystemMessage } from "./types";

const defaultSystemPrompt = `
# MISSION
Vous êtes LocaLLM, un assistant IA généraliste exécuté localement. Vous devez toujours répondre dans la langue détectée du message de l'utilisateur, que ce soit le français, l'anglais ou toute autre langue courante.

# LANGUE DE RÉPONSE
- Analyse le message utilisateur et déduis automatiquement sa langue.
- Réponds TOUJOURS dans **la langue du message utilisateur**, même si votre prompt système est en français.
- Si la langue est réellement ambiguë (ex : chiffres ou symboles uniquement), choisis le **français par défaut**.

# PRINCIPES CLÉS
1. **Fiabilité :** Ne jamais inventer d'informations. Si vous ne savez pas, dites-le.
2. **Transparence :** Vous ne pouvez pas accéder à Internet. Vos connaissances s'arrêtent à votre date d'entraînement.
3. **Efficacité :** Soyez clair, précis, et structuré. Réponses courtes si possible, longues si nécessaire.

# STYLE DE RÉPONSE
- Utilisez le Markdown.
- Mettez en gras les mots importants.
- Utilisez des listes, tableaux, ou code blocks dès que pertinent.
- Allez droit au but, sans formules de politesse.

# EXEMPLES DE LANGUE
- Si l'utilisateur écrit : "Can you help me with Docker config?" → vous répondez en anglais.
- Si l'utilisateur écrit : "Tu peux m'aider avec Docker ?" → vous répondez en français.
- Si l'utilisateur écrit : "¿Puedes ayudarme con Docker?" → vous répondez en espagnol.

Votre réponse doit TOUJOURS être dans la langue de l'utilisateur. Ignorez complètement la langue du système si elle diffère de celle de l’utilisateur.
`;

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
        description: 'Excellent en chat et raisonnement, très bon ratio perfs/taille.',
        params: '7B',
        size: '4.8GB',
        score: 'A+',
        avatar: '/avatar/01.png',
    },
    {
        id: 'gemma-2-9b-it-q4f32_1-MLC',
        name: 'Gemma 2 9B',
        description: 'Modèle texte/image puissant (et gourmand), adapté aux tâches complexes.',
        params: '9B',
        size: '5.0GB',
        score: 'A',
        avatar: '/avatar/02.png',
    },
    // {
    //     id: 'phi-3.5-vision-q4f16',
    //     name: 'Phi-3.5 Vision (q4f16)',
    //     description: 'Modèle multimodal (texte + image) compact et rapide. Idéal pour l\'usage léger.',
    //     params: '3.8B',
    //     size: '4.0GB',
    //     score: 'A',
    //     avatar: '/avatar/02.png',
    // },
    {
        id: 'Llama-3.2-3B-Instruct-q4f32_1-MLC',
        name: 'Llama 3.2 3B',
        description: "Petit modèle rapide et précis",
        params: '3B',
        size: '1.5GB',
        score: 'A+',
        avatar: '/avatar/01.png',
    },
]

class WebLLMService {
    private engine: MLCEngine | null = null;
    private isInitialized = false;
    private currentModel: string | null = null;
    private onTokenCallback: ((token: string) => void) | null = null;
    private onStatusCallback: ((status: InitProgressReport) => void) | null = null;
    private onInitializedCallback: ((isInitialized: boolean) => void) | null = null;
    private installedModels: string[] = [];
    private onModelChangeCallback: ((modelId: string) => void) | null = null;

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

    setModelChangeCallback(callback: (modelId: string) => void) {
        this.onModelChangeCallback = callback;
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
                    this.onInitializedCallback(true);
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
        // Notify model change
        if (this.onModelChangeCallback) {
            this.onModelChangeCallback(modelId);
        }
    }

    setOnTokenCallback(callback: (token: string) => void) {
        this.onTokenCallback = callback;
    }

    async generateResponse(messages: ChatMessage[], systemPrompt?: string): Promise<string> {
        if (!this.engine) {
            throw new Error("WebLLM not initialized");
        }

        try {
            const systemMessage: SystemMessage = {
                role: "system",
                content: systemPrompt ?? defaultSystemPrompt,
            };

            const allMessages = [systemMessage, ...messages];

            console.log("allMessages", allMessages);

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