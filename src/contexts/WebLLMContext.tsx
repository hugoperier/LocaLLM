// src/contexts/WebLLMContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { webLLMService } from '@/lib/webllm';

interface WebLLMContextType {
    isInitialized: boolean;
    currentModel: string | null;
    isModelLoading: boolean;
}

const WebLLMContext = createContext<WebLLMContextType | null>(null);

export function WebLLMProvider({ children }: { children: React.ReactNode }) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [currentModel, setCurrentModel] = useState<string | null>(null);
    const [isModelLoading, setIsModelLoading] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                await webLLMService.initialize();
                setCurrentModel(webLLMService.getCurrentModel());
                setIsInitialized(true);
            } catch (error) {
                console.error("Failed to initialize WebLLM:", error);
            }
        };

        init();
    }, []); // Un seul useEffect pour l'initialisation

    return (
        <WebLLMContext.Provider value={{ isInitialized, currentModel, isModelLoading }}>
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