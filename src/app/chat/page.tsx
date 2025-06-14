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

export default function Chat() {
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
    loadFromStorage,
  } = useConversations();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const sendMessage = async () => {
    if (
      userInput &&
      !isGenerating &&
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
      } catch (error) {
        console.error("Failed to generate response:", error);
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

  return (
    <div className="flex h-screen">
      <ConversationSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onAdd={add}
        onDelete={deleteOne}
        onClear={clearAll}
        onSelect={selectById}
      />
      <main className="flex-1 flex flex-col bg-muted/50">
        <ChatHeader />
        {selectedConversation ? (
          <>
            <ChatMessages
              conversation={selectedConversation.messages}
              isGenerating={isGenerating && generatingConversationId === selectedConversation.id}
              currentResponse={generatingConversationId === selectedConversation.id ? currentResponse : ""}
            />
            <ChatInput
              userInput={userInput}
              setUserInput={setUserInput}
              sendMessage={sendMessage}
              isGenerating={isGenerating}
              isInitialized={isInitialized}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Sélectionnez une conversation</p>
          </div>
        )}
      </main>
    </div>
  );
}
