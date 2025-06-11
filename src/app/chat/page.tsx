"use client";

import { useState } from "react";
import { webLLMService, ChatMessage } from "@/lib/webllm";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { useWebLLM } from "@/contexts/WebLLMContext";

interface Message {
  message: string;
  type: "bot" | "user";
}

export default function Chat() {
  const [userInput, setUserInput] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const { isInitialized } = useWebLLM();

  const addMessage = (message: Message) => {
    setConversation((oldArray: Message[]) => [...oldArray, message]);
  };

  const sendMessage = async () => {
    if (userInput && !isGenerating && isInitialized) {
      const userMessage = userInput;
      setUserInput(""); // clear the textarea
      addMessage({ message: userMessage, type: "user" });

      setIsGenerating(true);
      setCurrentResponse("");

      try {
        // Convert conversation to WebLLM format
        const webLLMMessages: ChatMessage[] = conversation.map((msg) => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.message.toString(),
        }));
        webLLMMessages.push({ role: "user", content: userMessage });

        // Set up token callback for streaming
        webLLMService.setOnTokenCallback((token) => {
          setCurrentResponse((prev) => prev + token);
        });

        // Generate response
        const response = await webLLMService.generateResponse(webLLMMessages);
        addMessage({ message: response, type: "bot" });
      } catch (error) {
        console.error("Failed to generate response:", error);
        addMessage({
          message: "Sorry, I encountered an error while generating a response.",
          type: "bot",
        });
      } finally {
        setIsGenerating(false);
        setCurrentResponse("");
      }
    }
  };

  return (
    <main className="h-screen flex flex-col bg-muted/50">
      <ChatHeader />
      <ChatMessages
        conversation={conversation}
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
    </main>
  );
}
