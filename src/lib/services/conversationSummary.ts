import { webLLMService } from "../webllm";
import { ChatMessage } from "../types";

export class ConversationSummaryService {
  private static instance: ConversationSummaryService;
  private summaryCache: Map<string, string> = new Map();

  private constructor() { }

  public static getInstance(): ConversationSummaryService {
    if (!ConversationSummaryService.instance) {
      ConversationSummaryService.instance = new ConversationSummaryService();
    }
    return ConversationSummaryService.instance;
  }

  public async generateSummary(conversationId: string, message: ChatMessage): Promise<string> {
    // Check cache first
    const cachedSummary = this.summaryCache.get(conversationId);
    if (cachedSummary) {
      return cachedSummary;
    }

    // Find the first user message

    try {
      const systemPrompt = `
Tu es un assistant qui résume très brièvement le contenu d’un message. Ta mission est de générer une **synthèse concise de 5 mots maximum**, qui capture le **sujet principal** du message de manière informative.
Contraintes :

- Résume uniquement le contenu, ne reformule pas tout.
- N’utilise **pas de verbes inutiles** ou de phrases complètes.
- Utilise des **mots-clés**, pas de ponctuation.
- **Pas de mise en forme** (pas de guillemets, pas de points).
- Ignore les formules de politesse ou le ton du message.
- Sois précis, pas vague (évite "demande", "info", "question" seul).
- Reponds dans la meme langue que le message (ou par défaut le français).

Exemples :
> "J’ai besoin d’aide pour configurer Docker avec un tunnel Cloudflare sur mon NAS"  
Résumé : docker cloudflare tunnel NAS

> "Est-ce que tu pourrais m’expliquer la différence entre Mistral 7B et Mixtral ?"  
Résumé : mistral mixtral comparaison modèles

> "Merci pour ton retour, je vais tester ta méthode ce soir"  
Résumé : test méthode proposée

> "Salut, peux-tu m’envoyer les fichiers JSON pour le projet d’assurance ?"  
Résumé : fichiers json assurance projet
`
      const userPrompt = `Résume en maximum 5 mots le message suivant: "${message.content}"`;
      const summaryMessages: ChatMessage[] = [
        { role: "user", content: userPrompt }
      ];

      const summary = await webLLMService.generateResponse(summaryMessages, systemPrompt);
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