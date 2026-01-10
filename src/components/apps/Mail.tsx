//Lets slowly move towards alias paths (@) for imports
import { AppTemplate } from "@/components/apps/AppTemplate";
import { Inbox, Trash2, Archive, Star, Search, Reply, Forward, Paperclip, Download, Eye, EyeOff, LogOut } from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useAppContext } from "@/components/AppContext";
import { useSessionStorage } from "@/hooks/useSessionStorage.ts";
import { cn } from "@/components/ui/utils";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useI18n } from "@/i18n";
import { decodePassword } from "@/utils/authUtils";
import { useFileSystem } from "@/components/FileSystemContext";
import { notify } from "@/services/notifications";
import { useThemeColors } from "@/hooks/useThemeColors";
import { AppMenuConfig } from "@/types.ts";

export interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
}

export interface Email {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  body: string;
  timestamp: Date | string; // Allow string for JSON parsing
  read: boolean;
  starred: boolean;
  archived: boolean;
  deleted: boolean;
  attachments?: EmailAttachment[];
}

// --- Security Helpers ---
const stripHtml = (text: string) => {
  if (!text) return "";

  let result = text;
  let previous;

  // 1. Remove script and style tags and their contents entirely
  // Replace with space to prevent tag re-construction and satisfy "Incomplete multi-character sanitization"
  // Handles unclosed tags via '$' to satisfy "Bad HTML filtering regexp"
  do {
    previous = result;
    result = result
      .replace(/<script\b[^>]*>[\s\S]*?(?:<\/script\b[^>]*>|$)/gim, " ")
      .replace(/<style\b[^>]*>[\s\S]*?(?:<\/style\b[^>]*>|$)/gim, " ");
  } while (result !== previous);

  // 2. Remove common Markdown syntax for a better text preview
  result = result
    .replace(/#{1,6}\s+/g, ' ') // Headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // Italic
    .replace(/`{3}[\s\S]*?`{3}/g, ' ') // Code blocks
    .replace(/`(.+?)`/g, '$1') // Inline code
    .replace(/^\s*[-*+]\s+/gm, ' ') // Unordered lists
    .replace(/^\s*\d+\.\s+/gm, ' ') // Ordered lists
    .replace(/^\s*>\s+/gm, ' '); // Blockquotes

  // 3. Robust recursive HTML tag removal to handle nested tags
  // This satisfies CodeQL's "Incomplete multi-character sanitization" and "Bad tag filter" alerts.
  // Replacing with a space ensures that removing partial tags doesn't create new ones.
  // The regex handles attributes with quotes effectively.
  do {
    previous = result;
    result = result.replace(/<(?:"[^"]*"|'[^']*'|[^"'>])*>/gm, ' ');
  } while (result !== previous);

  // 4. Decode common HTML entities for a cleaner preview
  // Using a single-pass replacement map with a broader regex to satisfy "Double escaping or unescaping"
  const entityMap: Record<string, string> = {
    'nbsp': ' ',
    'amp': '&',
    'lt': '<',
    'gt': '>',
    'quot': '"',
    '#39': "'"
  };

  result = result.replace(/&(#?[a-z0-9]+);/gi, (match, p1) => {
    return entityMap[p1.toLowerCase()] || match;
  });

  // 5. Final cleanup: collapse multiple whitespace and trim
  return result.replace(/\s+/g, ' ').trim();
};

export function Mail({ owner }: { owner?: string }) {
  const { t } = useI18n();
  const { createFile, resolvePath, readFile, writeFile, createDirectory, currentUser: globalUser } = useFileSystem();
  const { activeUser: desktopUser, accentColor } = useAppContext();
  const { getBackgroundColor, blurStyle } = useThemeColors();

  // Determine effective user (support for `sudo mail` or `su user mail`)
  const activeUser = owner || desktopUser || globalUser || 'guest';
  const userHome = activeUser === 'root' ? '/root' : `/home/${activeUser}`;

  // File System Paths - File Authority
  const configDir = `${userHome}/.Config`;
  const mailConfigPath = `${configDir}/mail.json`;
  const inboxPath = `${configDir}/inbox.json`;

  // Authentication state (Session)
  const [sessionUser, setSessionUser] = useSessionStorage<string | null>(
    "mail-current-user",
    null,
    activeUser
  );

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Soft Memory (UI State)
  const [activeMailbox, setActiveMailbox] = useSessionStorage(
    "mail-active-mailbox",
    "inbox",
    activeUser
  );

  // Hard Memory (Data)
  const [storedEmails, setStoredEmails] = useState<Email[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Auto-Login Logic ---
  useEffect(() => {
    const checkAutoLogin = async () => {
      // 1. Check for .Config/mail.json (Hacking Gameplay)
      const mailConfigContent = readFile(mailConfigPath, activeUser);
      if (mailConfigContent) {
        try {
          const config = JSON.parse(mailConfigContent);
          if (config.email) {
            setSessionUser(config.email);
            setAuthLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to parse mail.json", e);
        }
      }

      // 2. Fallback: Check if user is already logged in via session
      if (sessionUser) {
        setAuthLoading(false);
        return;
      }

      setAuthLoading(false);
    };

    checkAutoLogin();
  }, [readFile, setSessionUser, mailConfigPath, sessionUser, activeUser]);


  // --- Data Loading Logic ---
  const loadEmails = useCallback(() => {
    if (!sessionUser) return;

    // 1. Try reading from .Config/inbox.json
    const inboxContent = readFile(inboxPath, activeUser);
    if (inboxContent) {
      try {
        const data = JSON.parse(inboxContent);
        if (Array.isArray(data.emails)) {
          setStoredEmails(data.emails);
          if (data.emails.length > 0) {
            setSelectedEmailId(curr => curr || data.emails[0].id);
          }
          return;
        }
      } catch (e) {
        console.error("Failed to parse inbox.json", e);
      }
    }

    // 3. Empty state
    setStoredEmails([]);
  }, [sessionUser, readFile, inboxPath, activeUser]);

  // Load emails when user changes or mounts
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEmails();
  }, [loadEmails]);

  // --- Data Saving Logic ---
  // Any change to storedEmails should ideally persist to disk.
  // We use a useEffect with a small debounce or direct write could work.
  // Given this is a local simulator, direct write on change is fine for now.
  const persistEmails = useCallback((emailsToSave: Email[]) => {
    if (!sessionUser) return;

    // Ensure dir exists
    createDirectory(userHome, '.Config', activeUser);

    const data = {
      emails: emailsToSave,
      updatedAt: new Date().toISOString()
    };

    writeFile(inboxPath, JSON.stringify(data, null, 2), activeUser);
  }, [sessionUser, userHome, activeUser, createDirectory, writeFile, inboxPath]);

  // Only persist when emails actually change length or content. 
  // To avoid circular loops, we will wrap state setters instead of a broad useEffect.

  const updateEmails = (newEmails: Email[]) => {
    setStoredEmails(newEmails);
    persistEmails(newEmails);
  };

  // Responsive container measurement handled by AppTemplate
  // const [containerRef, { width }] = useElementSize();
  // const showSidebar = width >= 450;

  // Handle login - supports both TrustMail and local accounts
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!loginEmail.trim()) {
      setAuthError("Please enter your email");
      return;
    }

    if (!loginPassword) {
      setAuthError("Please enter your password");
      return;
    }

    setAuthLoading(true);
    setTimeout(() => {
      // Read credentials from filesystem
      const mailConfigContent = readFile(mailConfigPath, activeUser);

      if (!mailConfigContent) {
        setAuthLoading(false);
        setAuthError("No account found. Please create one on TrustMail first.");
        return;
      }

      try {
        const mailConfig = JSON.parse(mailConfigContent);

        // Verify email matches
        if (mailConfig.email !== loginEmail) {
          setAuthLoading(false);
          setAuthError("Invalid email or password");
          return;
        }

        // Verify password
        const storedPassword = decodePassword(mailConfig.password);
        if (storedPassword !== loginPassword && mailConfig.password !== loginPassword) {
          setAuthLoading(false);
          setAuthError("Invalid email or password");
          return;
        }

        // Successful Login
        setSessionUser(loginEmail);

        // Update last login timestamp
        const updatedConfig = {
          ...mailConfig,
          lastLogin: new Date().toISOString()
        };
        writeFile(mailConfigPath, JSON.stringify(updatedConfig, null, 2), activeUser);

        setAuthLoading(false);
        setLoginEmail("");
        setLoginPassword("");
      } catch (e) {
        console.error("Failed to parse mail.json", e);
        setAuthLoading(false);
        setAuthError("Configuration file corrupted. Please contact support.");
      }
    }, 600);
  };


  const handleLogout = () => {
    setSessionUser(null);
    setLoginEmail("");
    setLoginPassword("");
    setAuthError("");
    setStoredEmails([]);

    // Clear auto-login file
    writeFile(mailConfigPath, "", activeUser); // Write empty or delete.
  };

  // Ensure timestamps are Date objects (they become strings when stored in JSON)
  const emails = useMemo(() => {
    return storedEmails.map((email) => ({
      ...email,
      timestamp: new Date(email.timestamp),
    }));
  }, [storedEmails]);

  // Filter emails based on active mailbox
  const filteredEmails = useMemo(() => {
    let filtered = emails;

    // Filter by mailbox
    switch (activeMailbox) {
      case "inbox":
        filtered = filtered.filter((e) => !e.deleted && !e.archived);
        break;
      case "sent":
        // In a real app we'd have 'sent' property or 'from' check. 
        // For now, let's assume all stored emails are 'inbox' unless flagged otherwise, 
        // or we filter by 'from === sessionUser' (if we implemented sending)
        filtered = filtered.filter((e) => e.fromEmail === sessionUser && !e.deleted);
        break;
      case "starred":
        filtered = filtered.filter((e) => e.starred && !e.deleted);
        break;
      case "archived":
        filtered = filtered.filter((e) => e.archived && !e.deleted);
        break;
      case "trash":
        filtered = filtered.filter((e) => e.deleted);
        break;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.from.toLowerCase().includes(query) ||
          e.subject.toLowerCase().includes(query) ||
          e.body.toLowerCase().includes(query)
      );
    }

    // Sort by timestamp (newest first)
    return filtered.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [emails, activeMailbox, searchQuery, sessionUser]);

  const selectedEmail = selectedEmailId
    ? filteredEmails.find((e) => e.id === selectedEmailId)
    : null;

  // Actions
  const handleSelectEmail = (emailId: string) => {
    setSelectedEmailId(emailId);
    // Mark as read
    const email = storedEmails.find(e => e.id === emailId);
    if (email && !email.read) {
      const newEmails = storedEmails.map(e => e.id === emailId ? { ...e, read: true } : e);
      updateEmails(newEmails);
    }
  };

  const handleToggleStar = (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newEmails = storedEmails.map(email =>
      email.id === emailId ? { ...email, starred: !email.starred } : email
    );
    updateEmails(newEmails);
  };

  const handleDelete = () => {
    if (!selectedEmailId) return;
    const newEmails = storedEmails.map(e =>
      e.id === selectedEmailId ? { ...e, deleted: true } : e
    );
    updateEmails(newEmails);

    // Select next available
    const remaining = newEmails.filter(e => !e.deleted && !e.archived); // approximate next selection
    if (remaining.length > 0) {
      setSelectedEmailId(remaining[0].id);
    } else {
      setSelectedEmailId(null);
    }
  };

  const handleArchive = () => {
    if (!selectedEmailId) return;
    const newEmails = storedEmails.map(e =>
      e.id === selectedEmailId ? { ...e, archived: !e.archived } : e
    );
    updateEmails(newEmails);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return t("mail.time.minutesAgo", { minutes: diffMins });
    if (diffHours < 24) return t("mail.time.hoursAgo", { hours: diffHours });
    if (diffDays === 0) return t("mail.time.today");
    if (diffDays === 1) return t("mail.time.yesterday");
    if (diffDays < 7) return t("mail.time.daysAgo", { days: diffDays });
    return date.toLocaleDateString();
  };

  const handleDownloadAttachment = (attachment: EmailAttachment) => {
    const downloadsPath = resolvePath('~/Downloads', activeUser);
    const success = createFile(
      downloadsPath,
      attachment.name,
      attachment.content,
      activeUser
    );

    if (success) {
      notify.system(
        "success",
        t("mail.attachments.downloaded"),
        t("mail.attachments.downloadedTo", {
          name: attachment.name,
          folder: "Downloads",
        })
      );
    } else {
      notify.system(
        "error",
        t("mail.attachments.downloadFailed"),
        t("mail.attachments.downloadFailedMessage", { name: attachment.name })
      );
    }
  };

  // Show login page if not authenticated
  if (!sessionUser) {
    return (
      <AppTemplate
        content={
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="w-full max-w-sm relative z-10">
              <div
                className={cn(
                  "border border-white/10 rounded-xl p-6 shadow-2xl transition-all duration-300",
                )}
                style={{
                  background: getBackgroundColor(0.8),
                  ...blurStyle,
                  boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5)`
                }}
              >
                {/* Header */}
                <div className="text-center mb-6">
                  <h1 className="text-lg font-bold text-white">{t('mail.login.title')}</h1>
                  <p className="text-xs text-gray-400">{t('mail.login.subtitle')}</p>
                </div>

                {authError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                    {authError}
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <GlassInput
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder={t('mail.login.emailPlaceholder')}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="relative">
                      <GlassInput
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder={t('mail.login.passwordPlaceholder')}
                        required
                        className="w-full pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <GlassButton
                    type="submit"
                    disabled={authLoading}
                    className="w-full justify-center font-medium transition-all hover:brightness-110"
                    style={{ backgroundColor: accentColor }}
                  >
                    {authLoading ? t('mail.login.signingIn') : t('mail.login.signIn')}
                  </GlassButton>
                </form>

                {/* Info */}
                <div className="mt-4 pt-4 border-t border-gray-700 text-center">
                  <p className="text-xs text-gray-400">{t('mail.login.createAccountInfo')}</p>
                </div>
              </div>
            </div>
          </div>
        }
        hasSidebar={false}
      />
    );
  }

  const mailSidebar = {
    sections: [
      {
        title: t("mail.sidebar.mailboxes"),
        items: [
          {
            id: "inbox",
            label: t("mail.sidebar.inbox"),
            icon: Inbox,
            badge: "4",
          },
          { id: "starred", label: t("mail.sidebar.starred"), icon: Star },
          { id: "archived", label: t("mail.sidebar.archived"), icon: Archive },
          { id: "trash", label: t("mail.sidebar.trash"), icon: Trash2 },
        ],
      },
    ],
  };

  const unreadCount = emails.filter(
    (e) => !e.read && !e.deleted && !e.archived
  ).length;
  const updatedSidebar = {
    ...mailSidebar,
    sections: mailSidebar.sections.map((section) => ({
      ...section,
      items: section.items.map((item) =>
        item.id === "inbox"
          ? {
            ...item,
            badge: unreadCount > 0 ? unreadCount.toString() : undefined,
          }
          : item
      ),
    })),
  };

  const content = ({ contentWidth }: { contentWidth: number }) => {
    const isCompact = contentWidth < 400;
    const emailListWidth = isCompact
      ? 80
      : Math.min(360, Math.floor(contentWidth * 0.35));

    return (
      <div className="flex h-full min-w-0">
        {/* Email List */}
        <div
          className="border-r border-white/10 overflow-y-auto flex flex-col shrink-0"
          style={{ width: `${emailListWidth}px` }}
        >
          {/* Search Bar */}
          <div className={cn("p-2", isCompact && "flex justify-center")}>
            {!isCompact ? (
              <GlassInput
                placeholder={t("mail.search.placeholder")}
                icon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/20"
              />
            ) : (
              <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Email List Items */}
          <div className="space-y-1 px-1 flex-1">
            {filteredEmails.length === 0 ? (
              <div className="text-center text-white/40 text-sm py-8">
                {searchQuery
                  ? t("mail.empty.noEmailsFound")
                  : t("mail.empty.noEmails")}
              </div>
            ) : (
              filteredEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => handleSelectEmail(email.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSelectEmail(email.id);
                    }
                  }}
                  className={cn(
                    "w-full flex items-start gap-2 p-3 rounded-lg transition-colors text-left",
                    selectedEmailId === email.id
                      ? "bg-white/10"
                      : "hover:bg-white/5",
                    isCompact && "justify-center px-2"
                  )}
                  title={isCompact ? email.subject : undefined}
                >
                  <div className="relative mt-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStar(email.id, e);
                      }}
                      className="transition-transform active:scale-95"
                    >
                      <Star
                        className={cn(
                          "w-4 h-4 transition-colors",
                          email.starred
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-white/30 hover:text-white/60"
                        )}
                      />
                    </button>
                    {isCompact && !email.read && (
                      <div
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-[#1E1E1E] pointer-events-none"
                        style={{ backgroundColor: accentColor }}
                      />
                    )}
                  </div>

                  {!isCompact && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={cn(
                            "text-sm truncate",
                            email.read
                              ? "text-white/70"
                              : "text-white font-semibold"
                          )}
                        >
                          {email.from}
                        </span>
                        <span className="text-xs text-white/40 shrink-0">
                          {formatTime(email.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            "text-sm truncate flex-1",
                            email.read
                              ? "text-white/50"
                              : "text-white/80 font-medium"
                          )}
                        >
                          {email.subject}
                        </div>
                        {email.attachments && email.attachments.length > 0 && (
                          <Paperclip className="w-3.5 h-3.5 text-white/40 shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-white/40 truncate">
                        {stripHtml(email.body).substring(0, 60)}...
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Email Viewer */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedEmail ? (
            <>
              {/* Email Header */}
              <div className="border-b border-white/10 p-4 shrink-0 bg-white/5 backdrop-blur-md">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-white font-semibold text-lg mb-1 wrap-break-word">
                      {selectedEmail.subject}
                    </h2>
                    <div className="text-sm text-white/70">
                      <span className="font-medium">{selectedEmail.from}</span>
                      <span className="text-white/40">
                        {" "}
                        &lt;{selectedEmail.fromEmail}&gt;
                      </span>
                    </div>
                    <div className="text-xs text-white/40 mt-1">
                      {selectedEmail.timestamp.toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleToggleStar(selectedEmail.id, {} as React.MouseEvent)
                    }
                    className="shrink-0"
                  >
                    <Star
                      className={cn(
                        "w-5 h-5 transition-colors",
                        selectedEmail.starred
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-white/30 hover:text-white/60"
                      )}
                    />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <GlassButton size="sm" className="gap-2">
                    <Reply className="w-4 h-4" />
                    {t("mail.actions.reply")}
                  </GlassButton>
                  <GlassButton size="sm" className="gap-2">
                    <Forward className="w-4 h-4" />
                    {t("mail.actions.forward")}
                  </GlassButton>
                  <GlassButton
                    size="sm"
                    onClick={handleArchive}
                    className="gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    {selectedEmail.archived
                      ? t("mail.actions.unarchive")
                      : t("mail.actions.archive")}
                  </GlassButton>
                  <GlassButton
                    size="sm"
                    onClick={handleDelete}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("mail.actions.delete")}
                  </GlassButton>
                </div>
              </div>

              {/* Email Body */}
              <div className="flex-1 overflow-y-auto p-6 text-sm text-white/90 prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <p className="mb-5 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="my-5 pl-6 space-y-3">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="my-5 pl-6 space-y-3">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-white/95">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-white/85">{children}</em>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold mb-4 text-white">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold mb-3 text-white">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {children}
                      </h3>
                    ),
                  }}
                >
                  {selectedEmail.body}
                </ReactMarkdown>

                {/* Attachments */}
                {selectedEmail.attachments &&
                  selectedEmail.attachments.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <div className="flex items-center gap-2 mb-4 text-white/70">
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {selectedEmail.attachments.length === 1
                            ? t("mail.attachments.count", {
                              count: selectedEmail.attachments.length,
                            })
                            : t("mail.attachments.count_plural", {
                              count: selectedEmail.attachments.length,
                            })}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedEmail.attachments.map((attachment) => (
                          <button
                            key={attachment.id}
                            onClick={() => handleDownloadAttachment(attachment)}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left group"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white/90 truncate">
                                {attachment.name}
                              </div>
                              <div className="text-xs text-white/50">
                                {formatFileSize(attachment.size)}
                              </div>
                            </div>
                            <div className="shrink-0 text-white/40 group-hover:text-white/70 transition-colors">
                              <Download className="w-4 h-4" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-white/40">
                <Inbox className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>{t("mail.empty.selectEmail")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const toolbar = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: `linear-gradient(to bottom right, ${accentColor}, ${accentColor}80)`
          }}
        >
          <span className="text-white text-xs font-semibold">
            {sessionUser?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-white">{sessionUser}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm transition-all hover:opacity-90 shrink-0"
        style={{ backgroundColor: accentColor }}
      >
        <LogOut className="w-4 h-4" />
        {t('mail.login.signOut')}
      </button>
    </div>
  );

  return (
    <AppTemplate
      sidebar={updatedSidebar}
      toolbar={toolbar}
      content={content}
      activeItem={activeMailbox}
      onItemClick={(id) => setActiveMailbox(id)}
      minContentWidth={450}
    />
  );
}

export const mailMenuConfig: AppMenuConfig = {
  menus: ["File", "Edit", "View", "Mailbox", "Message", "Window", "Help"],
  items: {
    Mailbox: [
      {
        label: "New Mailbox",
        labelKey: "mail.menu.newMailbox",
        action: "new-mailbox",
      },
      { type: "separator" },
      {
        label: "Online Status",
        labelKey: "mail.menu.onlineStatus",
        action: "toggle-online",
      },
    ],
    Message: [
      {
        label: "New Message",
        labelKey: "mail.menu.newMessage",
        action: "new-message",
        shortcut: "Ctrl+N",
      },
      { type: "separator" },
      {
        label: "Reply",
        labelKey: "mail.menu.reply",
        action: "reply",
        shortcut: "Ctrl+R",
      },
      {
        label: "Reply All",
        labelKey: "mail.menu.replyAll",
        action: "reply-all",
        shortcut: "Ctrl+Shift+R",
      },
      {
        label: "Forward",
        labelKey: "mail.menu.forward",
        action: "forward",
        shortcut: "Ctrl+F",
      },
    ],
  },
};
