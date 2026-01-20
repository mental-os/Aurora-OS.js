import { AppTemplate } from '@/components/apps/AppTemplate';
import { MessageSquare, Star, Send, Search, Plus, Copy, Check, LogOut, Bell } from 'lucide-react';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useAppContext } from '@/components/AppContext';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { useElementSize } from '@/hooks/useElementSize';
import { cn } from '@/components/ui/utils';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';
import { useI18n } from '@/i18n/index';
import { useThemeColors } from '@/hooks/useThemeColors';
import { MessagesService, Conversation, Message } from '@/services/MessagesService';
import { useFileSystem } from '@/components/FileSystemContext';
import { notify } from '@/services/notifications';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { decodePassword } from "@/utils/authUtils";

// Helper to format time
const formatTime = (isoString: string, t: (key: string, options?: any) => string, timeMode: 'server' | 'local' = 'local') => {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  const timeZone = timeMode === 'server' ? 'UTC' : undefined;

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone });
  } else if (diffDays === 1) {
    return t('time.yesterday');
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short', timeZone });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', timeZone });
  }
};

export function Messages({ owner, initialPartner }: { owner?: string; initialPartner?: string }) {
  const { t } = useI18n();
  const { accentColor, activeUser: desktopUser, timeMode } = useAppContext();
  const { getBackgroundColor, blurStyle } = useThemeColors();
  const { createFile, createDirectory, readFile, deleteNode } = useFileSystem();
  
  // Determine effective user
  const effectiveUser = owner || desktopUser || 'guest';
  const userHome = effectiveUser === 'root' ? '/root' : `/home/${effectiveUser}`;
  const messagesConfigPath = `${userHome}/.Config/messages.json`;

  // Auth State
  const [sessionUser, setSessionUser] = useSessionStorage<string | null>('messages-session-user', null, effectiveUser);
  const [authView, setAuthView] = useState<'login' | 'register' | 'recover'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [createdRecoverySecret, setCreatedRecoverySecret] = useState<string | null>(null);
  
  // Recovery State
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryResult, setRecoveryResult] = useState<{username: string, password: string} | null>(null);

  // App State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(initialPartner || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useSessionStorage('messages-active-category', 'all', effectiveUser);

  // New Message Modal State
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [newMessageError, setNewMessageError] = useState('');

  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [containerRef] = useElementSize();
  // Fix: Use useState lazy initializer to safely get initial timestamp
  const [initialTime] = useState(() => Date.now());
  const lastCheckRef = useRef<number>(initialTime);

  // --- Persistence Helper ---
  const saveConfig = (user: string) => {
    try {
        const account = MessagesService.getAccount(user);
        if (!account) return;

        createDirectory(userHome, '.Config', effectiveUser);
        
        // Match Mail app standard
        const config = {
            username: user,
            password: account.passwordHash, // Store the encrypted hash
            recoverySecret: account.recoverySecret,
            lastLogin: new Date().toISOString(),
            service: 'aurora-messages',
            provider: 'aurora-net'
        };
        // Force write even if exists
        createFile(`${userHome}/.Config`, 'messages.json', JSON.stringify(config, null, 2), effectiveUser);
    } catch (e) {
        console.warn("Failed to save messages config", e);
    }
  };

  // --- Auto-Login Logic ---
  useEffect(() => {
    const checkAutoLogin = async () => {
      // 1. Check for .Config/messages.json (Hacking Gameplay)
      const configContent = readFile(messagesConfigPath, effectiveUser);
      if (configContent) {
        try {
            const config = JSON.parse(configContent);
            // Decode password to satisfy Service.login() check
            const decryptedPassword = decodePassword(config.password);
            
            if (MessagesService.login(config.username, decryptedPassword)) {
                 setSessionUser(config.username);
                 return;
            }
        } catch (e) {
          console.error("Failed to parse messages.json", e);
        }
      }
    };
    
    // Only run if not logged in
    if (!sessionUser) {
        checkAutoLogin();
    }
  }, [readFile, messagesConfigPath, effectiveUser, sessionUser, setSessionUser]);

  // --- Authentication Logic ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);

    setTimeout(() => {
      if (MessagesService.login(username, password)) {
        setSessionUser(username);
        saveConfig(username);
      } else {
        setAuthError('Invalid username or password');
      }
      setIsAuthLoading(false);
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);

    setTimeout(() => {
      const result = MessagesService.createAccount(username, password);
      if (result.success && result.secret) {
        setCreatedRecoverySecret(result.secret);
        // Don't auto-login yet, let them copy key
      } else {
        setAuthError(result.error || 'Registration failed');
      }
      setIsAuthLoading(false);
    }, 800);
  };

  const completeRegistration = () => {
    setSessionUser(username);
    saveConfig(username);
    setCreatedRecoverySecret(null);
  };

  const handleLogout = () => {
    setSessionUser(null);
    setUsername('');
    setPassword('');
    setConversations([]);
    setSelectedPartner(null);
    
    // Delete config file on logout
    deleteNode(messagesConfigPath, effectiveUser);
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);
    setRecoveryResult(null);

    setTimeout(() => {
        const recoveredPassword = MessagesService.recoverPassword(recoveryInput.trim());
        if (recoveredPassword) {
            setRecoveryResult({ username: "Your Account", password: recoveredPassword });
        } else {
            setAuthError("Invalid recovery key");
        }
        setIsAuthLoading(false);
    }, 800);
  };

  // --- Data Loading & Polling ---

  const refreshData = useCallback(() => {
    if (!sessionUser) return;

    // Load Conversations
    const convs = MessagesService.getConversations(sessionUser);
    setConversations(convs);

    // If active conversation, load messages
    if (selectedPartner) {
        const msgs = MessagesService.getMessages(sessionUser, selectedPartner);
        setMessages(prev => {
           if (prev.length !== msgs.length) {
               // Scroll check will be in effect
               return msgs; 
           }
           return prev; // No change reference if length same (simplified)
        });
        
        // Mark as read if needed
        const hasUnread = msgs.some(m => m.recipient === sessionUser && !m.read);
        if (hasUnread) {
          MessagesService.markAsRead(sessionUser, selectedPartner);
          // Need to refresh conversations badge next tick or immediately
        }
    }
    // Check for new messages since last check
    const lastCheck = lastCheckRef.current;
    let maxTimestamp = lastCheck;
    const newMessages: Message[] = [];

    convs.forEach(conv => {
       const msg = conv.lastMessage;
       const msgTime = new Date(msg.timestamp).getTime();
       
       if (msgTime > lastCheck && msg.recipient === sessionUser && !msg.read) {
           newMessages.push(msg);
           if (msgTime > maxTimestamp) maxTimestamp = msgTime;
       }
    });

    if (newMessages.length > 0) {
        // Sort by time, oldest first, so notifications appear in order
        newMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        // Notify
        newMessages.forEach(msg => {
            notify.app(
                'messages',
                effectiveUser, // The "owner" of the notification (system user) to target correct window
                `Message from ${msg.sender}`,
                msg.content,
                { partner: msg.sender } // Data to open the conversation
            );
        });
        
        lastCheckRef.current = maxTimestamp;
    }
  }, [sessionUser, selectedPartner, effectiveUser]);

  // Initial Sync
  useEffect(() => {
    const timer = setTimeout(() => refreshData(), 0);
    return () => clearTimeout(timer);
  }, [refreshData]);

  // Polling
  useEffect(() => {
    const interval = setInterval(() => {
       refreshData();
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshData]);
  
  // Auto-scroll on new messages
  useEffect(() => {
     if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
     }
  }, [messages]);

  // --- Actions ---

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageText.trim() || !sessionUser || !selectedPartner) return;

    const result = MessagesService.sendMessage(sessionUser, selectedPartner, messageText);
    if (result.success) {
      setMessageText('');
      // Immediate refresh
      refreshData();
      // Scroll handling
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 50);
    } else {
      notify.system('error', t('messages.ui.messageFailed'), result.error);
    }
  };

  const startNewConversation = () => {
    if (!newRecipient.trim() || !sessionUser) return;
    
    if (newRecipient === sessionUser) {
        setNewMessageError(t('messages.ui.cantMessageSelf'));
        return;
    }

    if (!MessagesService.userExists(newRecipient)) {
        setNewMessageError(t('messages.ui.userNotFound'));
        return;
    }

    setSelectedPartner(newRecipient);
    setIsNewMessageOpen(false);
    setNewRecipient('');
    setNewMessageError('');
  };

  const handleToggleStar = (e: React.MouseEvent, partner: string) => {
    e.stopPropagation();
    if (!sessionUser) return;
    MessagesService.toggleStar(sessionUser, partner);
    refreshData();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify.system("success", t('messages.auth.copied'), t('messages.auth.recoveryKeyCopied'));
    } catch {
      notify.system("error", t('messages.auth.error'), t('messages.auth.failedCopy'));
    }
  };


  // --- Render Helpers ---

  const filteredConversations = useMemo(() => {
    let filtered = conversations;
    
    // Filter by search
    if (searchQuery.trim()) {
      filtered = filtered.filter(c => c.partner.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    // Filter by Category
    if (activeCategory === 'unread') {
        filtered = filtered.filter(c => c.unreadCount > 0);
    } else if (activeCategory === 'starred') {
        filtered = filtered.filter(c => c.starred);
    }

    return filtered;
  }, [conversations, searchQuery, activeCategory]);

  const sidebarConfig = {
    sections: [
      {
        title: t('messages.sidebar.conversationsTitle'),
        items: [
          { id: 'all', label: t('messages.sidebar.allMessages') || 'All', icon: MessageSquare }, // Fallback
          { id: 'unread', label: t('messages.sidebar.unread') || 'Unread', icon: Bell },
          { id: 'starred', label: t('messages.sidebar.starred') || 'Starred', icon: Star }, 
        ],
      },
    ],
  };

      if (!sessionUser) {
    return (
      <AppTemplate
        content={
          <div className="min-h-full flex items-center justify-center p-4">
             {/* Account Creation Success View (Recovery Key) */}
             {createdRecoverySecret ? (
                 <div className="w-full max-w-md p-8 rounded-xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200"
                    style={{ background: getBackgroundColor(0.8), ...blurStyle, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mb-2">
                        <Check className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">{t('messages.auth.accountCreated')}</h2>
                        <p className="text-sm text-gray-300">
                            {t('messages.auth.saveRecoveryKey')}
                            <br/><span className="text-red-400 font-medium">{t('messages.auth.oneTimeShow')}</span>
                        </p>
                    </div>

                    <div className="w-full bg-black/30 rounded-lg p-4 border border-white/10 relative group">
                        <code className="text-lg font-mono text-yellow-400 tracking-wider">
                            {createdRecoverySecret}
                        </code>
                        <button 
                            onClick={() => copyToClipboard(createdRecoverySecret)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>

                    <GlassButton 
                        size="lg" 
                        onClick={completeRegistration}
                        className="w-full justify-center"
                        style={{ backgroundColor: accentColor }}
                    >
                        {t('messages.auth.savedContinue')}
                    </GlassButton>
                 </div>
             ) : (
                // Login / Register / Recovery Form
                <div className="w-full max-w-sm relative z-10">
                    <div
                        className={cn("border border-white/10 rounded-xl p-6 shadow-2xl transition-all duration-300")}
                        style={{
                            background: getBackgroundColor(0.8),
                            ...blurStyle,
                            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5)`
                        }}
                    >
                        <div className="text-center mb-6">
                            <h1 className="text-lg font-bold text-white">
                                {authView === 'login' ? t('messages.auth.welcomeBack') : 
                                 authView === 'register' ? t('messages.auth.createAccount') : 
                                 t('messages.auth.recoverAccount')}
                            </h1>
                            <p className="text-xs text-gray-400 mt-1">
                                {authView === 'login' ? t('messages.auth.signInToContinue') : 
                                 authView === 'register' ? t('messages.auth.joinSecureNetwork') :
                                 t('messages.auth.enterRecoveryKey')}
                            </p>
                        </div>

                        {authError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                                {t('messages.auth.invalidCredentials')}
                            </div>
                        )}
                        
                        {/* Recovery Result Success */}
                        {authView === 'recover' && recoveryResult && (
                             <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center animate-in fade-in slide-in-from-top-2">
                                <p className="text-xs text-green-400 mb-2">{t('messages.auth.credentialsRetrieved')}:</p>
                                <div className="bg-black/40 p-2 rounded border border-green-500/20 mb-3">
                                    <p className="text-xs text-gray-400">{t('messages.auth.password')}:</p>
                                    <p className="text-sm font-mono text-white font-bold tracking-wide select-all">{recoveryResult.password}</p>
                                </div>
                                <GlassButton 
                                    size="sm"
                                    onClick={() => {
                                        setAuthView('login');
                                        setPassword(recoveryResult.password);
                                        setRecoveryResult(null);
                                        setRecoveryInput('');
                                    }}
                                    className="w-full justify-center"
                                >
                                    {t('messages.auth.returnToLogin')}
                                </GlassButton>
                             </div>
                        )}

                        {!recoveryResult && (
                            <form onSubmit={authView === 'recover' ? handleRecovery : (authView === 'login' ? handleLogin : handleRegister)} className="space-y-3">
                                {authView === 'recover' ? (
                                    <div>
                                        <label className="text-xs text-gray-500 ml-1 mb-1 block">{t('messages.auth.recoveryKey')}</label>
                                        <GlassInput
                                            value={recoveryInput}
                                            onChange={(e) => setRecoveryInput(e.target.value)}
                                            placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                                            required
                                            className="w-full font-mono text-center tracking-widest uppercase"
                                            autoComplete="off"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="text-xs text-gray-500 ml-1 mb-1 block">{t('messages.auth.username')}</label>
                                            <GlassInput
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder={t('messages.auth.username')}
                                                required
                                                className="w-full"
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 ml-1 mb-1 block">{t('messages.auth.password')}</label>
                                            <GlassInput
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder={t('messages.auth.password')}
                                                required
                                                className="w-full"
                                            />
                                        </div>
                                    </>
                                )}

                                <GlassButton
                                    type="submit"
                                    disabled={isAuthLoading}
                                    className="w-full justify-center font-medium mt-2"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    {isAuthLoading ? t('messages.auth.processing') : (
                                        authView === 'login' ? t('messages.auth.signIn') : 
                                        authView === 'register' ? t('messages.auth.create') :
                                        t('messages.auth.recover')
                                    )}
                                </GlassButton>
                            </form>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-700 text-center flex flex-col gap-2">
                             {/* Toggle between Login/Register */}
                             {authView !== 'recover' && (
                                <button
                                    onClick={() => {
                                        setAuthView(authView === 'login' ? 'register' : 'login');
                                        setAuthError('');
                                        setUsername('');
                                        setPassword('');
                                    }}
                                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                                >
                                    {authView === 'login' ? t('messages.auth.noAccount') : t('messages.auth.haveAccount')}
                                </button>
                             )}
                            
                            {/* Toggle Recovery */}
                            <button
                                onClick={() => {
                                    setAuthView(authView === 'recover' ? 'login' : 'recover');
                                    setAuthError('');
                                    setRecoveryResult(null);
                                }}
                                className="text-[10px] text-gray-500 hover:text-gray-300 hover:underline transition-colors"
                            >
                                {authView === 'recover' ? t('messages.auth.backToLogin') : t('messages.auth.forgotPassword')}
                            </button>
                        </div>
                    </div>
                </div>
             )}
          </div>
        }
        hasSidebar={false}
      />
    );
  }

  // 2. Main App View
  
  const content = ({ contentWidth }: { contentWidth: number }) => {
    const isCompact = contentWidth < 600;
    const showList = !isCompact || !selectedPartner;
    const showChat = !isCompact || selectedPartner;

    return (
      <div className="flex w-full h-full relative">
        {/* Middle Pane: Conversation List */}
        {showList && (
            <div 
                className={cn(
                    "flex flex-col shrink-0 border-r border-white/10 transition-all",
                    isCompact ? "w-full absolute inset-0 z-20" : "w-64 md:w-72"
                )}
            >
                {/* Search Bar */}
                <div className="p-2 border-b border-white/5 flex gap-2 shrink-0">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
                        <GlassInput 
                            placeholder={t('messages.search.placeholder') || "Search..."}
                            className="w-full pl-9 h-9 bg-black/20 border-white/5 text-sm focus:bg-white/10 transition-colors" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setIsNewMessageOpen(true)}
                        className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/70 hover:text-white transition-colors shrink-0"
                        title="New Message"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredConversations.length === 0 ? (
                        <div className="text-center text-white/40 text-sm py-8">
                             {conversations.length === 0 ? t('messages.ui.noConversations') : t('messages.ui.noResults')}
                        </div>
                    ) : (
                        filteredConversations.map(conv => (
                        <button
                            key={conv.partner}
                            onClick={() => setSelectedPartner(conv.partner)}
                            className={cn(
                                "w-full rounded-lg p-3 flex items-center gap-3 transition-all text-left group border border-transparent",
                                selectedPartner === conv.partner 
                                    ? "bg-white/10 border-white/5 shadow-inner" 
                                    : "hover:bg-white/5"
                            )}
                        >
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-sm ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                                    {conv.partner[0].toUpperCase()}
                                </div>
                                {conv.unreadCount > 0 && (
                                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#1E1E1E] shadow-sm" />
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className={cn("text-sm font-medium truncate", selectedPartner === conv.partner ? "text-white" : "text-gray-200")}>
                                        {conv.partner}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-500">
                                            {formatTime(conv.lastMessage.timestamp, t, timeMode)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className={cn("text-xs truncate pr-2", conv.unreadCount > 0 ? "text-gray-300 font-medium" : "text-gray-500")}>
                                        {conv.lastMessage.sender === sessionUser && "You: "}
                                        {conv.lastMessage.content}
                                    </p>
                                    <button
                                        onClick={(e) => handleToggleStar(e, conv.partner)}
                                        className={cn(
                                            "shrink-0 p-1 -mr-1 rounded-full hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100",
                                            conv.starred && "opacity-100"
                                        )}
                                    >
                                        <Star className={cn("w-3 h-3", conv.starred ? "fill-yellow-400 text-yellow-400" : "text-gray-500")} />
                                    </button>
                                </div>
                            </div>
                        </button>
                        ))
                    )}
                </div>
            </div>
        )}

        {/* Right Pane (Chat) */}
        {showChat && (
            <div className={cn("flex-1 flex flex-col min-w-0 bg-transparent relative", isCompact && "absolute inset-0 z-10 w-full")}>
               {selectedPartner ? (
                 <>
                    {/* Chat Header */}
                    <div className="h-[60px] border-b border-white/10 flex items-center justify-between px-6 shrink-0 bg-white/5 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            {isCompact && (
                                <button 
                                    onClick={() => setSelectedPartner(null)}
                                    className="p-1 -ml-2 mr-1 rounded-full hover:bg-white/10 text-white/70 transition-colors"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                </button>
                            )}
                            <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/10 shadow-lg">
                                {selectedPartner[0].toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white leading-none tracking-tight">{selectedPartner}</h3>
                                <span className="text-[10px] text-green-400 font-medium flex items-center gap-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                    {t('messages.ui.online')}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <button
                                onClick={(e) => selectedPartner && handleToggleStar(e, selectedPartner)}
                                className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-yellow-400 transition-colors"
                                title={conversations.find(c => c.partner === selectedPartner)?.starred ? t('messages.ui.unstar') : t('messages.ui.star')}
                            >
                                <Star className={cn("w-5 h-5", conversations.find(c => c.partner === selectedPartner)?.starred && "fill-yellow-400 text-yellow-400")} />
                            </button>
                        </div>
                    </div>
    
                    {/* Messages List */}
                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                        {messages.map((msg, idx) => {
                            const isMe = msg.sender === sessionUser;
                            const showTime = idx === 0 || 
                                 (new Date(msg.timestamp).getTime() - new Date(messages[idx-1].timestamp).getTime() > 5 * 60 * 1000);
    
                            return (
                                <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                                    {showTime && (
                                        <div className="text-[10px] text-white/20 text-center w-full mb-4 font-medium uppercase tracking-wider">
                                            {formatTime(msg.timestamp, t, timeMode)}
                                        </div>
                                    )}
                                    <div 
                                        className={cn(
                                            "max-w-[75%] rounded-2xl px-5 py-2.5 text-sm relative group shadow-md transition-all hover:shadow-lg",
                                            isMe 
                                              ? "text-white rounded-br-sm" 
                                              : "bg-white/10 text-gray-100 rounded-bl-sm backdrop-blur-md border border-white/5"
                                        )}
                                        style={isMe ? { backgroundColor: accentColor } : {}}
                                    >
                                        {msg.content}
                                    </div>
                                    {isMe && idx === messages.length - 1 && (
                                        <div className="flex items-center gap-1 mt-1 mr-1">
                                            {msg.read ? (
                                                <div className="flex text-blue-400">
                                                    <Check className="w-3 h-3" />
                                                    <Check className="w-3 h-3 -ml-1.5" />
                                                </div>
                                            ) : (
                                                <Check className="w-3 h-3 text-white/30" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
    
                    {/* Input Area */}
                    <div className="p-4 bg-white/5 backdrop-blur-md border-t border-white/10">
                        <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto items-center">
                             <div className="flex-1 relative group">
                                <GlassInput 
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    placeholder={t('messages.ui.typeMessage', { partner: selectedPartner })}
                                    className="w-full rounded-2xl px-5 py-3 h-11 border-white/10 bg-black/20 focus:bg-black/40 transition-all font-medium text-sm"
                                    autoFocus
                                />
                             </div>
                             <GlassButton 
                                type="submit" 
                                disabled={!messageText.trim()}
                                className={cn(
                                    "rounded-xl w-11 h-11 p-0 flex items-center justify-center shrink-0 transition-all duration-300",
                                    messageText.trim() ? "hover:scale-105 hover:shadow-lg" : "opacity-30 grayscale"
                                )}
                                style={{ backgroundColor: messageText.trim() ? accentColor : undefined }}
                             >
                                 <Send className="w-5 h-5 ml-0.5" />
                             </GlassButton>
                        </form>
                    </div>
                 </>
               ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20 text-white" />
                        <h3 className="text-lg font-medium text-white/40 mb-2">{t('messages.ui.noChatSelected')}</h3>
                        <p className="text-sm text-white/30 max-w-xs mb-6">{t('messages.ui.chooseConversation')}</p>
                        <GlassButton 
                            onClick={() => setIsNewMessageOpen(true)}
                            className="gap-2 bg-white/5 hover:bg-white/10 border-white/10 px-6 py-2 rounded-xl transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            {t('messages.ui.startNewMessage')}
                        </GlassButton>
                    </div>
               )}
            </div>
        )}
      </div>
    );
  };

  const toolbar = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg ring-1 ring-white/10"
          style={{
            background: `linear-gradient(to bottom right, ${accentColor}, ${accentColor}80)`
          }}
        >
          <span className="text-white text-xs font-bold">
            {sessionUser?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-bold text-white">{sessionUser}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm transition-all hover:opacity-90 shrink-0 shadow-md active:scale-95"
        style={{ backgroundColor: accentColor }}
      >
        <LogOut className="w-4 h-4" />
        {t('mail.login.signOut') || "Sign Out"}
      </button>
    </div>
  );

  return (
    <div ref={containerRef} className="h-full w-full">
      <AppTemplate
        sidebar={sidebarConfig}
        toolbar={toolbar}
        content={content}
        activeItem={activeCategory}
        onItemClick={(id) => setActiveCategory(id)}
        sidebarCollapseBreakpoint={500}
      />

      {/* New Message Dialog */}
      <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
        <DialogContent 
            className="sm:max-w-[425px] bg-[#1E1E1E]/80 border-white/10 text-white backdrop-blur-xl"
            overlayClassName="backdrop-blur-sm"
        >
            <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
                <DialogDescription className="text-gray-400">
                    Enter the username of the person you want to message.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-300 ml-1">To:</label>
                    <GlassInput 
                        value={newRecipient} 
                        onChange={(e) => {
                            setNewRecipient(e.target.value);
                            setNewMessageError('');
                        }}
                        placeholder="username"
                        className="w-full"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') startNewConversation();
                        }}
                        autoFocus
                    />
                    {newMessageError && (
                        <p className="text-xs text-red-400 ml-1">{newMessageError}</p>
                    )}
                </div>
            </div>
            <DialogFooter>
                <GlassButton onClick={() => setIsNewMessageOpen(false)} className="bg-transparent hover:bg-white/5 border border-white/10">
                    Cancel
                </GlassButton>
                <GlassButton 
                    onClick={startNewConversation}
                    disabled={!newRecipient.trim()}
                    style={{ backgroundColor: accentColor }}
                >
                    Start Chat
                </GlassButton>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Menu Configuration
export const messagesMenuConfig: any = {
    menus: ['File', 'Edit', 'View', 'Conversations', 'Window', 'Help'],
    items: {
      'Conversations': [
        { label: 'New Message', labelKey: 'messages.menu.newMessage', shortcut: '⌘N', action: 'new-message' },
        { type: 'separator' },
        // ...
      ]
    }
};
