import { AppTemplate } from "./AppTemplate";
import { Inbox, Trash2, Archive, Star, Search, Reply, Forward, Paperclip, Download } from "lucide-react";
import { useState, useMemo } from "react";
import { useAppContext } from "../AppContext";
import { useSessionStorage } from "@/hooks/useSessionStorage.ts";
import { useElementSize } from "@/hooks/useElementSize.ts";
import { cn } from "../ui/utils";
import { GlassInput } from "../ui/GlassInput";
import { GlassButton } from "../ui/GlassButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useI18n } from "@/i18n";
import { useFileSystem } from "../FileSystemContext";
import { notify } from "@/services/notifications";

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
  timestamp: Date;
  read: boolean;
  starred: boolean;
  archived: boolean;
  deleted: boolean;
  attachments?: EmailAttachment[];
}

const mockEmails: Email[] = [
  {
    id: "1",
    from: "Sarah Chen",
    fromEmail: "sarah.chen@company.com",
    subject: "Q4 Project Update - Review Required",
    body: `Hi there,

I hope this email finds you well. I wanted to share the **latest updates** on our Q4 project timeline.

Key highlights:

- **Phase 1:** Completed ahead of schedule
- *Phase 2:* Currently in progress, 75% done
- **Phase 3:** Scheduled to start next week

Please review the attached documents and let me know if you have any concerns. We need your approval by **Friday EOD**.

Best regards,
Sarah`,
    timestamp: new Date("2024-01-04T10:30:00"),
    read: false,
    starred: true,
    archived: false,
    deleted: false,
    attachments: [
      {
        id: "att-1-1",
        name: "Q4_Project_Timeline.txt",
        size: 245600,
        type: "application/text",
        content:
          "Q4 Project Timeline\n\nPhase 1: Infrastructure Setup (Completed)\nPhase 2: Development (In Progress - 75%)\nPhase 3: Testing & Deployment (Scheduled)\n\nDetailed timeline and milestones attached.",
      },
      {
        id: "att-1-2",
        name: "Budget_Report.txt",
        size: 128400,
        type: "application/text",
        content:
          "Budget Report Q4\n\nTotal Budget: $500,000\nSpent: $375,000 (75%)\nRemaining: $125,000\n\nBreakdown by department included.",
      },
    ],
  },
  {
    id: "2",
    from: "DevOps Team",
    fromEmail: "devops@internal.system",
    subject: "System Maintenance Scheduled - Tomorrow 2AM",
    body: `Dear Team,

This is an automated notification regarding scheduled system maintenance.

**Maintenance Window:**

- **Date:** January 5, 2024
- **Time:** 2:00 AM - 4:00 AM EST
- *Expected Downtime:* Approximately 2 hours

During this time, the following services will be **unavailable**:

- Authentication servers
- Database clusters
- API endpoints

Please plan accordingly. *All services will be restored by 4:00 AM.*

Thank you for your patience.`,
    timestamp: new Date("2024-01-04T09:15:00"),
    read: true,
    starred: false,
    archived: false,
    deleted: false,
  },
  {
    id: "3",
    from: "Michael Rodriguez",
    fromEmail: "mike.r@external.com",
    subject: "Re: Collaboration Opportunity",
    body: `Hi,

Thank you for reaching out! I'm *very interested* in exploring this collaboration opportunity.

I've reviewed your proposal and I think it aligns perfectly with our current goals. Here are my thoughts:

1. **Timeline:** The proposed 6-month timeline seems reasonable
2. **Budget:** We might need to discuss adjustments for Q2
3. *Resources:* I can commit 2 senior developers and 1 designer

Would you be available for a call next week to discuss the details? I'm free on **Tuesday afternoon** or **Thursday morning**.

Looking forward to working together!

Best,
Michael`,
    timestamp: new Date("2024-01-03T16:45:00"),
    read: true,
    starred: true,
    archived: false,
    deleted: false,
  },
  {
    id: "4",
    from: "Newsletter Team",
    fromEmail: "newsletter@tech-weekly.com",
    subject: "Your Weekly Tech Digest - January Edition",
    body: `Hello Tech Enthusiast!

Welcome to this week's edition of **Tech Weekly Digest**.

**📱 Top Stories This Week:**

- **AI Breakthrough:** New model achieves 99% accuracy in medical diagnosis
- *Quantum Computing:* Major advancement in error correction announced
- **Web Development:** React 19 beta released with exciting new features
- Cybersecurity alert: Critical vulnerability patched in popular framework

*Featured Article:*

**"The Future of Remote Work"** - An in-depth analysis of how workplace dynamics are evolving in 2024. Companies are adopting *hybrid models* at an unprecedented rate.

Click below to read the full newsletter on our website.

Happy reading! 📚`,
    timestamp: new Date("2024-01-02T08:00:00"),
    read: false,
    starred: false,
    archived: false,
    deleted: false,
    attachments: [
      {
        id: "att-4-1",
        name: "Tech_Weekly_January.text",
        size: 1024000,
        type: "application/text",
        content:
          "Tech Weekly Digest - January Edition\n\nFull newsletter with articles, interviews, and technology trends.",
      },
    ],
  },
];

export function Mail({ owner }: { owner?: string }) {
  const { t } = useI18n();
  const { createFile, resolvePath } = useFileSystem();
  const [activeMailbox, setActiveMailbox] = useSessionStorage(
    "mail-active-mailbox",
    "inbox",
    owner
  );
  const [storedEmails, setStoredEmails] = useSessionStorage<Email[]>(
    "mail-emails",
    mockEmails,
    owner
  );
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(
    storedEmails[0]?.id || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const { accentColor } = useAppContext();

  // Ensure timestamps are Date objects (they become strings when stored in localStorage)
  const emails = useMemo(() => {
    return storedEmails.map((email) => ({
      ...email,
      timestamp:
        email.timestamp instanceof Date
          ? email.timestamp
          : new Date(email.timestamp),
    }));
  }, [storedEmails]);

  const setEmails = (value: Email[] | ((prev: Email[]) => Email[])) => {
    if (typeof value === "function") {
      setStoredEmails((prev) => {
        const normalizedPrev = prev.map((email) => ({
          ...email,
          timestamp:
            email.timestamp instanceof Date
              ? email.timestamp
              : new Date(email.timestamp),
        }));
        return value(normalizedPrev);
      });
    } else {
      setStoredEmails(value);
    }
  };

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

  // Filter emails based on active mailbox
  const filteredEmails = useMemo(() => {
    let filtered = emails;

    // Filter by mailbox
    if (activeMailbox === "inbox") {
      filtered = filtered.filter((e) => !e.deleted && !e.archived);
    } else if (activeMailbox === "starred") {
      filtered = filtered.filter((e) => e.starred && !e.deleted);
    } else if (activeMailbox === "archived") {
      filtered = filtered.filter((e) => e.archived && !e.deleted);
    } else if (activeMailbox === "trash") {
      filtered = filtered.filter((e) => e.deleted);
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
  }, [emails, activeMailbox, searchQuery]);

  const selectedEmail = selectedEmailId
    ? filteredEmails.find((e) => e.id === selectedEmailId)
    : null;

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

  const handleSelectEmail = (emailId: string) => {
    setSelectedEmailId(emailId);
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId && !e.read ? { ...e, read: true } : e))
    );
  };

  const handleToggleStar = (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmails((prev) =>
      prev.map((email) =>
        email.id === emailId ? { ...email, starred: !email.starred } : email
      )
    );
  };

  const handleDelete = () => {
    if (!selectedEmailId) return;
    setEmails((prev) =>
      prev.map((e) => (e.id === selectedEmailId ? { ...e, deleted: true } : e))
    );
    setSelectedEmailId(filteredEmails[0]?.id || null);
  };

  const handleArchive = () => {
    if (!selectedEmailId) return;
    setEmails((prev) =>
      prev.map((e) =>
        e.id === selectedEmailId ? { ...e, archived: !e.archived } : e
      )
    );
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownloadAttachment = (attachment: EmailAttachment) => {
    const downloadsPath = resolvePath('~/Downloads', owner);
    const success = createFile(
      downloadsPath,
      attachment.name,
      attachment.content
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

  // Responsive container measurement
  const [containerRef, { width }] = useElementSize();
  const showSidebar = width >= 450;

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
                <button
                  key={email.id}
                  onClick={() => handleSelectEmail(email.id)}
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
                      onClick={(e) => handleToggleStar(email.id, e)}
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
                        {email.body.replace(/<[^>]*>/g, "").substring(0, 60)}...
                      </div>
                    </div>
                  )}
                </button>
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

  return (
    <div ref={containerRef} className="h-full w-full">
      <AppTemplate
        sidebar={updatedSidebar}
        content={content}
        hasSidebar={showSidebar}
        activeItem={activeMailbox}
        onItemClick={(id) => setActiveMailbox(id)}
        minContentWidth={0}
      />
    </div>
  );
}

import { AppMenuConfig } from "@/types.ts";

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
        shortcut: "⌘N",
        action: "new-message",
      },
      { type: "separator" },
      {
        label: "Reply",
        labelKey: "mail.menu.reply",
        shortcut: "⌘R",
        action: "reply",
      },
      {
        label: "Reply All",
        labelKey: "mail.menu.replyAll",
        shortcut: "⇧⌘R",
        action: "reply-all",
      },
      {
        label: "Forward",
        labelKey: "mail.menu.forward",
        shortcut: "⇧⌘F",
        action: "forward",
      },
    ],
  },
};
