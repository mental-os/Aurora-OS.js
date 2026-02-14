import { Email } from "@/components/apps/Mail";
import { encodePassword, decodePassword } from "@/utils/authUtils";
import { STORAGE_KEYS } from "@/utils/memory";

const DB_KEY = `${STORAGE_KEYS.APP_DATA_PREFIX}mail-server-db`;

export interface MailAccount {
  email: string;
  passwordHash: string; // Encrypted password
  name: string;
  createdAt: string;
  recoverySecret: string; // Plain text secret for recovery
  emails: Email[];
}

export interface MailDatabase {
  accounts: Record<string, MailAccount>; // email -> account
}

class MailServiceImpl {
  private getDB(): MailDatabase {
    if (typeof window === "undefined") return { accounts: {} };

    const stored = localStorage.getItem(DB_KEY);
    if (!stored) {
      return { accounts: {} };
    }

    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("MailService: Failed to parse DB", e);
      return { accounts: {} };
    }
  }

  private saveDB(db: MailDatabase) {
    if (typeof window === "undefined") return;
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  // Generate a random recovery secret (simulated 4-word phrase or code)
  private generateSecret(): string {
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);

    // Convert to base36 strings to look like the original format but securely generated
    return Array.from(array)
      .map(x => x.toString(36).substring(0, 5).padEnd(5, '0'))
      .join('-');
  }

  createAccount(
    email: string,
    password: string,
    name: string = "User"
  ): { success: boolean; secret?: string } {
    const db = this.getDB();

    if (db.accounts[email]) {
      return { success: false }; // Already exists
    }

    const secret = this.generateSecret();

    const newAccount: MailAccount = {
      email,
      passwordHash: encodePassword(password),
      name,
      createdAt: new Date().toISOString(),
      recoverySecret: secret,
      emails: [],
    };

    db.accounts[email] = newAccount;
    this.saveDB(db);
    return { success: true, secret };
  }

  login(email: string, password: string): boolean {
    const db = this.getDB();
    const account = db.accounts[email];

    if (!account) return false;

    // In a real app we'd hash, here we just decode/compare or compare encoded
    // Since we store encoded, we can compare encoded or decode.
    // Let's decode to maintain the "hacking" simulation logic clearly
    const storedPassword = decodePassword(account.passwordHash);
    return storedPassword === password;
  }

  getAccount(email: string): MailAccount | null {
    const db = this.getDB();
    return db.accounts[email] || null;
  }

  // Recover password using the secret
  recoverPassword(secret: string): string | null {
    const db = this.getDB();
    const account = Object.values(db.accounts).find(acc => acc.recoverySecret === secret);

    if (account) {
      return decodePassword(account.passwordHash);
    }
    return null;
  }

  getEmails(email: string): Email[] {
    const account = this.getAccount(email);
    return account ? account.emails || [] : [];
  }


  // Helper to add emails (e.g. welcome emails)
  addEmails(email: string, newEmails: Email[]) {
    const db = this.getDB();
    const account = db.accounts[email];

    if (account) {
      account.emails = [...newEmails, ...account.emails];
      this.saveDB(db);
    }
  }
  // Update specific fields of an email
  updateEmail(emailAddress: string, emailId: string, updates: Partial<Email>) {
    const db = this.getDB();
    const account = db.accounts[emailAddress];

    if (account && account.emails) {
      account.emails = account.emails.map(email =>
        email.id === emailId ? { ...email, ...updates } : email
      );
      this.saveDB(db);
    }
  }
  // Delete an email permanently
  deleteEmail(emailAddress: string, emailId: string) {
    const db = this.getDB();
    const account = db.accounts[emailAddress];

    if (account && account.emails) {
      account.emails = account.emails.filter(email => email.id !== emailId);
      this.saveDB(db);
    }
  }
}

export const MailService = new MailServiceImpl();
