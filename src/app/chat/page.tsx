"use client";

import { useState } from "react";
import { webLLMService } from "@/lib/webllm";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { useWebLLM } from "@/contexts/WebLLMContext";
import { useConversations } from "@/hooks/useConversations";
import { Button } from "@/components/ui/button";

export default function Chat() {
  const [userInput, setUserInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const { isInitialized } = useWebLLM();
  const {
    conversations,
    selectedConversation,
    add,
    deleteOne,
    clearAll,
    selectById,
    addMessage,
  } = useConversations();

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
        message: userMessage,
        type: "user",
      });

      setIsGenerating(true);
      setCurrentResponse("");

      try {
        // Convert conversation to WebLLM format
        const webLLMMessages: ChatMessage[] = selectedConversation.messages
          .concat({ message: userMessage, type: "user" })
          .map((msg) => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.message.toString(),
        }));

        // Set up token callback for streaming
        webLLMService.setOnTokenCallback((token) => {
          setCurrentResponse((prev) => prev + token);
        });

        // Generate response
        const response = await webLLMService.generateResponse(webLLMMessages);
        await addMessage(selectedConversation.id, {
          message: response,
          type: "bot",
        });
      } catch (error) {
        console.error("Failed to generate response:", error);
        await addMessage(selectedConversation.id, {
          message: "Sorry, I encountered an error while generating a response.",
          type: "bot",
        });
      } finally {
        setIsGenerating(false);
        setCurrentResponse("");
      }
    }
  };

  const formatTitle = (timestamp: number) =>
    new Date(timestamp).toLocaleString();

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r flex flex-col">
        <div className="p-2 flex gap-2 border-b">
          <Button className="flex-1" onClick={add}>
            + Nouvelle conversation
          </Button>
          <Button variant="destructive" onClick={clearAll}>
            🗑️
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => selectById(conv.id)}
              className={`flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-muted ${
                selectedConversation?.id === conv.id ? "bg-muted" : ""
              }`}
            >
              <span className="text-sm truncate">
                {formatTitle(conv.timestamp)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteOne(conv.id);
                }}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      </aside>
      <main className="flex-1 flex flex-col bg-muted/50">
        <ChatHeader />
        {selectedConversation ? (
          <>
            <ChatMessages
              conversation={selectedConversation.messages}
              isGenerating={isGenerating}
              currentResponse={currentResponse}
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
