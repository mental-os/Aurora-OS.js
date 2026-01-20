import { encodePassword, decodePassword } from "@/utils/authUtils";
import { STORAGE_KEYS } from "@/utils/memory";

const DB_KEY = STORAGE_KEYS.MESSAGES_DB; // Custom key for Messages app

export interface Message {
  id: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  partner: string; // The other person in the chat
  lastMessage: Message;
  unreadCount: number;
  starred: boolean;
}

export interface MessageAccount {
  username: string; // Acts as the ID
  passwordHash: string;
  createdAt: string;
  recoverySecret: string;
  starredPartners?: string[]; // List of usernames starred by this account
}

export interface MessagesDatabase {
  accounts: Record<string, MessageAccount>; // username -> account
  messages: Message[]; // Flat list of all messages (normalized DB approach easier for filtering)
}

class MessagesServiceImpl {
  private getDB(): MessagesDatabase {
    if (typeof window === "undefined") return { accounts: {}, messages: [] };

    const stored = localStorage.getItem(DB_KEY);
    if (!stored) {
      // Seed with some initial data if empty? Or start clean.
      // Let's start clean but maybe we should migrate mock data if we wanted.
      // For now, clean slate + ability to create account.
      return { accounts: {}, messages: [] };
    }

    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("MessagesService: Failed to parse DB", e);
      return { accounts: {}, messages: [] };
    }
  }

  private saveDB(db: MessagesDatabase) {
    if (typeof window === "undefined") return;
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateSecret(): string {
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    return Array.from(array)
      .map((x) => x.toString(36).substring(0, 5).padEnd(5, "0"))
      .join("-");
  }

  // --- Auth & Account ---

  userExists(username: string): boolean {
    const db = this.getDB();
    return !!db.accounts[username];
  }

  createAccount(
    username: string,
    password: string
  ): { success: boolean; secret?: string; error?: string } {
    const db = this.getDB();

    if (this.userExists(username)) {
      return { success: false, error: "Username already taken" };
    }

    const secret = this.generateSecret();
    const newAccount: MessageAccount = {
      username,
      passwordHash: encodePassword(password),
      createdAt: new Date().toISOString(),
      recoverySecret: secret,
      starredPartners: [],
    };

    db.accounts[username] = newAccount;
    this.saveDB(db);
    return { success: true, secret };
  }

  login(username: string, password: string): boolean {
    const db = this.getDB();
    const account = db.accounts[username];
    if (!account) return false;

    const storedPassword = decodePassword(account.passwordHash);
    return storedPassword === password;
  }

  getAccount(username: string): MessageAccount | undefined {
    const db = this.getDB();
    return db.accounts[username];
  }

  recoverPassword(secret: string): string | null {
    const db = this.getDB();
    // Find account with matching secret
    const account = Object.values(db.accounts).find(acc => acc.recoverySecret === secret);
    
    if (account) {
        return decodePassword(account.passwordHash);
    }
    return null;
  }

  // --- Messaging ---

  sendMessage(
    from: string,
    to: string,
    content: string
  ): { success: boolean; error?: string } {
    if (!this.userExists(to)) {
      return { success: false, error: "User does not exist" };
    }

    const db = this.getDB();
    const newMessage: Message = {
      id: this.generateId(),
      sender: from,
      recipient: to,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };

    db.messages.push(newMessage);
    this.saveDB(db);
    return { success: true };
  }

  toggleStar(username: string, partner: string) {
    const db = this.getDB();
    const account = db.accounts[username];
    if (!account) return;

    if (!account.starredPartners) {
        account.starredPartners = [];
    }

    if (account.starredPartners.includes(partner)) {
        account.starredPartners = account.starredPartners.filter(p => p !== partner);
    } else {
        account.starredPartners.push(partner);
    }
    this.saveDB(db);
  }

  getConversations(username: string): Conversation[] {
    const db = this.getDB();
    const account = db.accounts[username];
    const starredList = account?.starredPartners || [];

    // Find all messages where user is sender or recipient
    const userMessages = db.messages.filter(
      (m) => m.sender === username || m.recipient === username
    );

    // Group by partner
    const grouped: Record<string, Message[]> = {};

    userMessages.forEach((m) => {
      const partner = m.sender === username ? m.recipient : m.sender;
      if (!grouped[partner]) grouped[partner] = [];
      grouped[partner].push(m);
    });

    // Convert to Conversation objects
    return Object.entries(grouped)
      .map(([partner, msgs]) => {
        // Sort to find last message
        msgs.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ); // Newest first
        const lastMsg = msgs[0];

        // Count unread (messages FROM partner to ME that are !read)
        const unreadCount = msgs.filter(
          (m) => m.sender === partner && m.recipient === username && !m.read
        ).length;

        return {
          partner,
          lastMessage: lastMsg,
          unreadCount,
          starred: starredList.includes(partner),
        };
      })
      .sort(
        (a, b) => {
           // Sort by starred first? No, Mail app sorts by date usually, with filter.
           // Let's stick to date sort for "All", filtering handles user view.
           return new Date(b.lastMessage.timestamp).getTime() -
           new Date(a.lastMessage.timestamp).getTime()
        }
      );
  }

  getMessages(user1: string, user2: string): Message[] {
    const db = this.getDB();
    const msgs = db.messages.filter(
      (m) =>
        (m.sender === user1 && m.recipient === user2) ||
        (m.sender === user2 && m.recipient === user1)
    );

    // Sort oldest to newest
    return msgs.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  markAsRead(recipient: string, sender: string) {
    const db = this.getDB();
    let changed = false;

    db.messages.forEach((m) => {
      if (m.recipient === recipient && m.sender === sender && !m.read) {
        m.read = true;
        changed = true;
      }
    });

    if (changed) {
      this.saveDB(db);
    }
  }
}

export const MessagesService = new MessagesServiceImpl();
