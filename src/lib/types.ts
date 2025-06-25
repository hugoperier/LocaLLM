export interface SystemMessage {
    role: "system";
    content: string;
}

export interface UserMessage {
    role: "user";
    content: string;
    edited?: boolean;
}

export interface AssistantMessage {
    role: "assistant";
    content: string;
    edited?: boolean;
}

export type ChatMessage = SystemMessage | UserMessage | AssistantMessage;