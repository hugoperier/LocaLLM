export interface SystemMessage {
    role: "system";
    content: string;
}

export interface UserMessage {
    role: "user";
    content: string;
}

export interface AssistantMessage {
    role: "assistant";
    content: string;
}

export type ChatMessage = SystemMessage | UserMessage | AssistantMessage;