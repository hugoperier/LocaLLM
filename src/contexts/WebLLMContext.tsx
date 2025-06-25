// src/contexts/WebLLMContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { webLLMService } from '@/lib/webllm';
import { InitProgressReport } from '@mlc-ai/web-llm';

interface WebLLMContextType {
    isInitialized: boolean;
    currentModel: string | null;
    isModelLoading: boolean;
    status: InitProgressReport | null;
}

const WebLLMContext = createContext<WebLLMContextType | null>(null);

export function WebLLMProvider({ children }: { children: React.ReactNode }) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [currentModel, setCurrentModel] = useState<string | null>(null);
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [status, setStatus] = useState<InitProgressReport | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                webLLMService.setStatusCallback((status) => {
                    setStatus(status);
                    setIsModelLoading(true);
                });
                webLLMService.setInitializedCallback((initialized) => {
                    setIsInitialized(initialized);
                    setIsModelLoading(false);
                });
                webLLMService.setModelChangeCallback((modelId) => {
                    setCurrentModel(modelId);
                    setIsModelLoading(false);
                });
                await webLLMService.initialize();
                setCurrentModel(webLLMService.getCurrentModel());
            } catch (error) {
                console.error("Failed to initialize WebLLM:", error);
                setIsModelLoading(false);
            }
        };

        init();
    }, []); // Un seul useEffect pour l'initialisation

    return (
        <WebLLMContext.Provider value={{ isInitialized, currentModel, isModelLoading, status }}>
            {children}
        </WebLLMContext.Provider>
    );
}

export const useWebLLM = () => {
    const context = useContext(WebLLMContext);
    if (!context) {
        throw new Error('useWebLLM must be used within a WebLLMProvider');
    }
    return context;
};