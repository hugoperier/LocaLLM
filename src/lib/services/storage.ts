import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Conversation } from '@/hooks/useConversations';

interface ConversationDB extends DBSchema {
  conversations: {
    key: string;
    value: Conversation;
  };
}

class StorageService {
  private static instance: StorageService;
  private db: IDBPDatabase<ConversationDB> | null = null;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public async initialize() {
    if (this.db) return;

    this.db = await openDB<ConversationDB>('locallm-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('conversations')) {
          db.createObjectStore('conversations', { keyPath: 'id' });
        }
      },
    });
  }

  public async saveConversations(conversations: Conversation[]) {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction('conversations', 'readwrite');
    const store = tx.objectStore('conversations');

    // Clear existing conversations
    await store.clear();

    // Save all conversations
    for (const conversation of conversations) {
      await store.put(conversation);
    }

    await tx.done;
  }

  public async loadConversations(): Promise<Conversation[]> {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction('conversations', 'readonly');
    const store = tx.objectStore('conversations');
    return store.getAll();
  }
}

export const storageService = StorageService.getInstance(); 