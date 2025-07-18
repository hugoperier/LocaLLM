"use client";

import { useState, useEffect } from "react";
import { webLLMService } from "@/lib/webllm";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { useWebLLM } from "@/contexts/WebLLMContext";
import { useConversations } from "@/hooks/useConversations";
import { ChatMessage } from "@/lib/types";
import { ModelSelectorModal } from "@/components/chat/ModelSelectorModal";
import { ToastProvider } from "@/components/ui/toast";

function ChatContent() {
  const [userInput, setUserInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [generatingConversationId, setGeneratingConversationId] = useState<string | null>(null);
  const { isInitialized } = useWebLLM();
  const {
    conversations,
    selectedConversation,
    add,
    deleteOne,
    clearAll,
    selectById,
    addMessage,
    updateMessage,
    truncateMessages,
    loadFromStorage,
    updateTitle,
  } = useConversations();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const { showToast } = require("@/components/ui/toast").useToast();
  const [isReloadingModel, setIsReloadingModel] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    console.log("isInitialized", isInitialized);
    console.log("webLLMService.getInstalledModels()", webLLMService.getInstalledModels());
    if (isInitialized && webLLMService.getInstalledModels().length === 0) {
      setShowWelcomeModal(true);
    } else {
      setShowWelcomeModal(false);
    }
  }, [isInitialized]);

  const sendMessage = async () => {
    if (
      userInput &&
      !isGenerating &&
      !isReloadingModel &&
      isInitialized &&
      selectedConversation
    ) {
      const userMessage = userInput;
      setUserInput(""); // clear the textarea
      await addMessage(selectedConversation.id, {
        content: userMessage,
        role: "user",
      });

      setIsGenerating(true);
      setCurrentResponse("");
      setGeneratingConversationId(selectedConversation.id);

      try {
        // Convert conversation to WebLLM format
        const webLLMMessages: ChatMessage[] = selectedConversation.messages
          .concat({ content: userMessage, role: "user" })
          .map((msg) => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content.toString(),
          }));

        // Set up token callback for streaming
        webLLMService.setOnTokenCallback((token) => {
          setCurrentResponse((prev) => prev + token);
        });

        // Generate response
        const response = await webLLMService.generateResponse(webLLMMessages);
        await addMessage(selectedConversation.id, {
          content: response,
          role: "assistant",
        });
      } catch (error: any) {
        const errorMsg = String(error?.toString?.() || error?.message || error);
        const isVectorIntError = errorMsg.includes("Expected null or instance of VectorInt");
        if (isVectorIntError) {
          showToast("Erreur WebLLM détectée, rechargement du modèle en cours...", { type: "error" });
          setIsReloadingModel(true);
          const currentModel = webLLMService.getCurrentModel();
          if (currentModel) {
            try {
              await webLLMService.loadModel(currentModel);
              showToast("Modèle rechargé avec succès !", { type: "success" });
            } catch (reloadError) {
              showToast("Échec du rechargement du modèle.", { type: "error" });
            }
          } else {
            showToast("Aucun modèle courant à recharger.", { type: "error" });
          }
          setIsReloadingModel(false);
        }
        await addMessage(selectedConversation.id, {
          content: "Sorry, I encountered an error while generating a response.",
          role: "assistant",
        });
      } finally {
        setIsGenerating(false);
        setCurrentResponse("");
        setGeneratingConversationId(null);
      }
    }
  };

  const handleEditMessage = async (index: number, content: string) => {
    if (!selectedConversation || isGenerating || isReloadingModel || !isInitialized) {
      return;
    }

    updateMessage(selectedConversation.id, index, content);
    truncateMessages(selectedConversation.id, index);

    const updatedConv = useConversations.getState().selectedConversation;
    if (!updatedConv) return;

    setIsGenerating(true);
    setCurrentResponse("");
    setGeneratingConversationId(updatedConv.id);

    try {
      const webLLMMessages: ChatMessage[] = updatedConv.messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content.toString(),
      }));

      webLLMService.setOnTokenCallback((token) => {
        setCurrentResponse((prev) => prev + token);
      });

      const response = await webLLMService.generateResponse(webLLMMessages);
      await addMessage(updatedConv.id, {
        content: response,
        role: "assistant",
      });
    } catch (error: any) {
      const errorMsg = String(error?.toString?.() || error?.message || error);
      const isVectorIntError = errorMsg.includes("Expected null or instance of VectorInt");
      if (isVectorIntError) {
        showToast("Erreur WebLLM détectée, rechargement du modèle en cours...", { type: "error" });
        setIsReloadingModel(true);
        const currentModel = webLLMService.getCurrentModel();
        if (currentModel) {
          try {
            await webLLMService.loadModel(currentModel);
            showToast("Modèle rechargé avec succès !", { type: "success" });
          } catch (reloadError) {
            showToast("Échec du rechargement du modèle.", { type: "error" });
          }
        } else {
          showToast("Aucun modèle courant à recharger.", { type: "error" });
        }
        setIsReloadingModel(false);
      }
      await addMessage(updatedConv.id, {
        content: "Sorry, I encountered an error while generating a response.",
        role: "assistant",
      });
    } finally {
      setIsGenerating(false);
      setCurrentResponse("");
      setGeneratingConversationId(null);
    }
  };

  // Ajout logique pour empêcher la création d'un nouveau chat si le dernier est vide
  const handleAddConversation = () => {
    if (conversations.length > 0 && conversations[0].messages.length === 0) {
      selectById(conversations[0].id);
    } else {
      add();
    }
  };

  return (
    <>
      <ModelSelectorModal
        isOpen={showWelcomeModal}
        onOpenChange={setShowWelcomeModal}
        welcomeMode
        forceOpen
      />
      <div className="flex h-screen">
        <ConversationSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          onAdd={handleAddConversation}
          onDelete={deleteOne}
          onClear={clearAll}
          onSelect={selectById}
          onRename={updateTitle}
        />
        <main className="flex-1 flex flex-col bg-muted/50">
          <ChatHeader />
          {selectedConversation ? (
            <>
              <ChatMessages
                conversation={selectedConversation.messages}
                isGenerating={isGenerating && generatingConversationId === selectedConversation.id}
                currentResponse={generatingConversationId === selectedConversation.id ? currentResponse : ""}
                onEditMessage={handleEditMessage}
              />
              <ChatInput
                userInput={userInput}
                setUserInput={setUserInput}
                sendMessage={sendMessage}
                isGenerating={isGenerating || isReloadingModel}
                isInitialized={isInitialized}
              />
              {isReloadingModel && (
                <div className="flex justify-center items-center py-2 text-sm text-muted-foreground animate-pulse">
                  Rechargement du modèle en cours...
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Sélectionnez une conversation</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default function Chat() {
  return (
    <ToastProvider>
      <ChatContent />
    </ToastProvider>
  );
}
