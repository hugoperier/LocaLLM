import { webLLMService } from "../webllm";
import { ChatMessage } from "../types";

export class ConversationSummaryService {
  private static instance: ConversationSummaryService;
  private summaryCache: Map<string, string> = new Map();

  private constructor() {}

  public static getInstance(): ConversationSummaryService {
    if (!ConversationSummaryService.instance) {
      ConversationSummaryService.instance = new ConversationSummaryService();
    }
    return ConversationSummaryService.instance;
  }

  public async generateSummary(conversationId: string, message: ChatMessage): Promise<string> {
    // Check cache first
    console.log("Generating summary for conversation", conversationId);
    const cachedSummary = this.summaryCache.get(conversationId);
    if (cachedSummary) {
      return cachedSummary;
    }

    // Find the first user message

    try {
      const prompt = `Résume en maximum 5 mots le message suivant: "${message.content}"`;
      console.log("Prompt:", prompt);
      const summaryMessages: ChatMessage[] = [
        { role: "user", content: prompt }
      ];

      const summary = await webLLMService.generateResponse(summaryMessages);
      console.log("Summary:", summary);
      // Cache the result
      this.summaryCache.set(conversationId, summary);
      
      return summary;
    } catch (error) {
      console.error("Failed to generate conversation summary:", error);
      return "Nouvelle conversation";
    }
  }

  public clearCache(conversationId?: string) {
    if (conversationId) {
      this.summaryCache.delete(conversationId);
    } else {
      this.summaryCache.clear();
    }
  }
} 