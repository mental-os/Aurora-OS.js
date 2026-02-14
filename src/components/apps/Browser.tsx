import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Home, Star, Lock, AlertTriangle, X, Plus, Globe, WifiOff } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { GlassButton } from '@/components/ui/GlassButton';
import { AppTemplate } from '@/components/apps/AppTemplate';
import { useAppStorage } from '@/hooks/useAppStorage';
import { cn } from '@/components/ui/utils';
import { useI18n } from '@/i18n/index';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getWebsiteByDomain } from '@/components/websites/registry';
import type { HistoryEntry } from '@/components/websites/types';
import { useAppContext } from '@/components/AppContext';
import { useFileSystem } from '@/components/FileSystemContext';
import { useNetworkContext } from '@/components/NetworkContext';
import { parseHostsFile, resolveHost } from '@/utils/network';
import { incrementSessionDataUsage } from '@/utils/memory';

interface Tab {
  id: string;
  url: string;
  renderedUrl: string;
  title: string;
  isLoading: boolean;
  progress: number;
  history: HistoryEntry[];
  historyIndex: number;
}

// Fallback tab to prevent crashes if state is empty
const FALLBACK_TAB: Tab = {
  id: 'fallback',
  url: 'browser://welcome',
  renderedUrl: 'browser://welcome',
  title: 'Welcome', // This is state, might need t() at render time or initial state? 
  // State usually keeps the raw 'title'. Let's check where it's used.
  // It's used in TabBar (tab.title).
  // If we store 'Welcome', we can't translate easily later unless we store key?
  // For now, let's look at the error screen which is easier.
  isLoading: false,
  progress: 0,
  history: [{ url: 'browser://welcome', title: 'Welcome', timestamp: new Date() }],
  historyIndex: 0
};

export function Browser({ owner }: { owner?: string }) {
  const { t } = useI18n();
  const { accentColor } = useAppContext();
  const { readFile } = useFileSystem();
  const { wifiEnabled, currentNetwork, availableNetworks } = useNetworkContext();
  const { titleBarBackground, blurStyle, getBackgroundColor } = useThemeColors();

  // Refs for network state to access inside setInterval
  const networkRef = useRef({ wifiEnabled, currentNetwork, availableNetworks });
  useEffect(() => {
    networkRef.current = { wifiEnabled, currentNetwork, availableNetworks };
  }, [wifiEnabled, currentNetwork, availableNetworks]);

  // Track active interval to clear on re-navigation
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Persisted state
  const [appState, setAppState] = useAppStorage('browser', {
    url: 'browser://welcome',
    bookmarks: [] as string[],
    history: [] as HistoryEntry[],
  }, owner);

  // Tabs State
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const initialUrl = appState.url || 'browser://welcome';

    const sanitizedHistory = (appState.history || []).map(h => ({
      ...h,
      timestamp: new Date(h.timestamp)
    }));

    // Ensure we always start with at least one tab
    return [{
      id: 'default',
      url: initialUrl,
      renderedUrl: initialUrl,
      title: 'Welcome',
      isLoading: false,
      progress: 0,
      history: sanitizedHistory.length ? sanitizedHistory : [{ url: initialUrl, title: 'Welcome', timestamp: new Date() }],
      historyIndex: (sanitizedHistory.length || 1) - 1
    }];
  });

  const [activeTabId, setActiveTabId] = useState<string>('default');

  // FIX: Safe access to activeTab with fallback
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0] || FALLBACK_TAB;

  // FIX: Ensure activeTab is defined before accessing .url
  const [urlInput, setUrlInput] = useState(activeTab ? activeTab.url : 'browser://welcome');

  // Sync Input when Active Tab switches
  // We use state instead of ref to track changes during render safely.
  // This pattern updates state during render to avoid input flicker.
  const [prevTabId, setPrevTabId] = useState(activeTabId);
  if (prevTabId !== activeTabId) {
    setPrevTabId(activeTabId);
    setUrlInput(activeTab.url);
  }

  // Destructure properties needed for persistence to avoid depending on the entire 'activeTab' object.
  // This prevents the effect from running on every progress tick (which creates a new activeTab object).
  const { id: currentTabId, renderedUrl: currentRenderedUrl, history: currentHistory } = activeTab;

  // Persist current tab state and HISTORY
  useEffect(() => {
    if (currentTabId !== 'fallback') {
      setAppState(prev => ({
        ...prev,
        url: currentRenderedUrl,
        history: currentHistory
      }));
    }
  }, [currentTabId, currentRenderedUrl, currentHistory, setAppState]);

  const getActiveWebsite = () => {
    if (!activeTab) return null;
    const [urlPath] = activeTab.renderedUrl.split('?');
    return getWebsiteByDomain(urlPath);
  };

  const currentWebsite = getActiveWebsite();
  const WebsiteComponent = currentWebsite?.component;
  const isBookmarked = appState.bookmarks.includes(activeTab.renderedUrl);

  const getParams = () => {
    const [, queryString] = activeTab.renderedUrl.split('?');
    const params: Record<string, string> = {};
    if (queryString) {
      new URLSearchParams(queryString).forEach((value, key) => {
        params[key] = value;
      });
    }
    return params;
  };

  // --- Bookmark Logic ---
  const toggleBookmark = () => {
    const currentUrl = activeTab.renderedUrl;
    setAppState(prev => {
      const isPinned = prev.bookmarks.includes(currentUrl);
      if (isPinned) {
        return { ...prev, bookmarks: prev.bookmarks.filter(b => b !== currentUrl) };
      } else {
        return { ...prev, bookmarks: [...prev.bookmarks, currentUrl] };
      }
    });
  };

  // --- Tab Management ---
  const addTab = () => {
    const newTab: Tab = {
      id: crypto.randomUUID(),
      url: 'browser://welcome',
      renderedUrl: 'browser://welcome',
      title: 'New Tab',
      isLoading: false,
      progress: 0,
      history: [{ url: 'browser://welcome', title: 'New Tab', timestamp: new Date() }],
      historyIndex: 0
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setUrlInput('browser://welcome');
  };

  const closeTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      navigate('browser://welcome');
      return;
    }

    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    if (tabId === activeTabId) {
      const index = tabs.findIndex(t => t.id === tabId);
      const nextTab = newTabs[index - 1] || newTabs[0];

      if (nextTab) {
        setActiveTabId(nextTab.id);
        setUrlInput(nextTab.url);
      }
    }
  };

  // --- Navigation Logic ---
  const navigate = (url: string) => {
    // 1. Resolve Host from /etc/hosts (DNS Poisoning Simulation)
    let targetDomain = url;
    try {
      const hostsContent = readFile('/etc/hosts');
      if (hostsContent) {
        const hostsMap = parseHostsFile(hostsContent);
        // Extract domain from URL
        const urlObj = new URL(url.includes('://') ? url : `http://${url}`);
        const hostname = urlObj.hostname;

        const resolvedIP = resolveHost(hostname, hostsMap);

        if (resolvedIP !== hostname) {
          targetDomain = url.replace(hostname, resolvedIP);
        }
      }
    } catch {
      // Invalid URL or other error, proceed with original
    }

    const website = getWebsiteByDomain(targetDomain);
    const finalUrl = website ? website.domain : targetDomain;
    const isLocalPage = finalUrl.startsWith('browser://');
    const isConnected = wifiEnabled && currentNetwork;

    // Check Offline State immediately
    if (!isConnected && !isLocalPage) {
      setTabs(prev => prev.map(t => {
        if (t.id !== activeTabId) return t;
        return { ...t, url: finalUrl, renderedUrl: finalUrl, isLoading: false, progress: 0 };
      }));
      setUrlInput(finalUrl);
      return;
    }

    // 2. Update Tab to Loading State
    setTabs(prev => prev.map(t => {
      if (t.id !== activeTabId) return t;
      // We keep the ORIGINAL url for the address bar if it was a redirect, 
      // mimicking how a browser shows the domain you typed even if DNS points elsewhere (until it loads)
      // BUT if it's a valid website config (like if 127.0.0.1 was mapped to a 'Localhost' site), we might show that.
      return { ...t, url: finalUrl, isLoading: true, progress: 0 };
    }));
    setUrlInput(url);

    let currentProgress = 0;
    const PAGE_SIZE_MB = 2.5; // Average page size
    const TICK_RATE_MS = 100;

    loadingIntervalRef.current = setInterval(() => {
      // Local pages load instantly regardless of network
      if (isLocalPage) {
        currentProgress += 20;
      } else {
        const { wifiEnabled, currentNetwork, availableNetworks } = networkRef.current;
        const activeNetwork = availableNetworks.find(n => n.ssid === currentNetwork);

        // Speed in Mbps (Megabits per second)
        // If not connected, speed is 0
        const speedMbps = (wifiEnabled && activeNetwork) ? activeNetwork.speed : 0;

        // Convert to MB/s (Megabytes per second)
        const speedMBps = speedMbps / 8;

        // Downloaded in this tick
        const downloadedMB = speedMBps * (TICK_RATE_MS / 1000);

        // Track usage
        incrementSessionDataUsage(downloadedMB);

        // Progress increment (percentage of page size)
        const percentIncrement = (downloadedMB / PAGE_SIZE_MB) * 100;

        currentProgress += percentIncrement;
      }

      if (currentProgress >= 100) {
        if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
        updateTabProgress(activeTabId, 100);
        setTimeout(() => {
          finishNavigation(activeTabId, finalUrl, website);
        }, 100);
      } else {
        // Cap at 95% until finished
        updateTabProgress(activeTabId, Math.min(95, currentProgress));
      }

    }, TICK_RATE_MS);
  };

  const updateTabProgress = (tabId: string, progress: number) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, progress } : t));
  };

  const finishNavigation = (tabId: string, url: string, website: any) => {
    setTabs(prev => prev.map(t => {
      if (t.id !== tabId) return t;

      const newEntry: HistoryEntry = {
        url,
        title: website?.name || url,
        timestamp: new Date(),
        favicon: website?.color,
      };

      // If we navigated while in the middle of history, discard forward history
      const cleanHistory = t.history.slice(0, t.historyIndex + 1);

      return {
        ...t,
        isLoading: false,
        progress: 0,
        renderedUrl: url,
        title: website?.name || url,
        history: [...cleanHistory, newEntry],
        historyIndex: cleanHistory.length
      };
    }));
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) navigate(urlInput.trim());
  };

  const reload = () => navigate(activeTab.renderedUrl);
  const goHome = () => navigate('browser://welcome');

  const goBack = () => {
    if (activeTab.historyIndex > 0) {
      const prevIndex = activeTab.historyIndex - 1;
      const prevEntry = activeTab.history[prevIndex];

      setTabs(prev => prev.map(t => t.id === activeTabId ? {
        ...t,
        renderedUrl: prevEntry.url,
        url: prevEntry.url,
        title: prevEntry.title,
        historyIndex: prevIndex,
        // Don't show full loading bar for back navigation (snappier feel)
        isLoading: false
      } : t));
      setUrlInput(prevEntry.url);
    }
  };

  const goForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const nextIndex = activeTab.historyIndex + 1;
      const nextEntry = activeTab.history[nextIndex];

      setTabs(prev => prev.map(t => t.id === activeTabId ? {
        ...t,
        renderedUrl: nextEntry.url,
        url: nextEntry.url,
        title: nextEntry.title,
        historyIndex: nextIndex,
        isLoading: false
      } : t));
      setUrlInput(nextEntry.url);
    }
  };

  // --- Rendering ---
  const getSecurityIcon = () => {
    if (!currentWebsite) return <Lock className="w-3.5 h-3.5 text-gray-400" />;
    switch (currentWebsite.security) {
      case 'secure': return <Lock className="w-3.5 h-3.5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" />;
      case 'insecure': return <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
      default: return <Lock className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  // Helper for Bookmark Bar
  const getBookmarkDetails = (url: string) => {
    const [urlPath] = url.split('?');
    const website = getWebsiteByDomain(urlPath);
    return {
      title: website?.name || url,
      url: url,
      //icon: website?.icon || Globe        // Fallback icon, for future, when/if we decide to add icons for the sites
    };
  };

  const TabBar = (
    <div className="flex items-center w-full gap-1 overflow-x-auto no-scrollbar pt-2 px-2">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => setActiveTabId(tab.id)}
          style={{
            borderColor: tab.id === activeTabId ? accentColor : "transparent",
            background: tab.id === activeTabId
              ? `linear-gradient(to top, ${accentColor}15, transparent)`
              : "transparent"
          }}
          className={cn(
            "group flex items-center gap-2 px-4 py-2 text-xs font-medium cursor-pointer transition-all min-w-[140px] max-w-[220px] border-b-2",
            tab.id === activeTabId
              ? "text-white"
              : "text-white/40 hover:text-white/80 hover:bg-white/5"
          )}
        >
          {tab.isLoading ? (
            <RotateCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
          ) : (
            <div className={cn("w-3.5 h-3.5 flex items-center justify-center")}>
              <span className={cn("w-1.5 h-1.5 rounded-full", tab.id === activeTabId ? "bg-white" : "bg-white/40 group-hover:bg-white/60")} style={{ backgroundColor: tab.id === activeTabId ? accentColor : undefined }} />
            </div>
          )}
          <span className="truncate flex-1">{tab.title}</span>
          <button
            onClick={(e) => closeTab(e, tab.id)}
            className="opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-full p-0.5 transition-all"
          >
            <X className="w-3 h-3 text-white/70 hover:text-white" />
          </button>
        </div>
      ))}
      <button
        onClick={addTab}
        className="h-7 w-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors ml-1"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );

  const content = (
    <div className="flex flex-col min-h-full relative">
      {/* Navbar Container */}
      <div
        className="sticky top-0 z-20 border-b border-white/10 shadow-sm flex flex-col"
        style={{ background: titleBarBackground, ...blurStyle }}
      >
        {/* Top Row: Navigation & URL */}
        <div className="flex items-center px-3 py-2 gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={goBack}
              disabled={activeTab.historyIndex <= 0}
              className="p-1.5 rounded hover:bg-white/10 text-white/70 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goForward}
              disabled={activeTab.historyIndex >= activeTab.history.length - 1}
              className="p-1.5 rounded hover:bg-white/10 text-white/70 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={reload} className="p-1.5 hover:bg-white/10 rounded text-white/70 transition-colors">
              <RotateCw className={cn("w-4 h-4", activeTab.isLoading && "animate-spin")} />
            </button>
            <button onClick={goHome} className="p-1.5 hover:bg-white/10 rounded text-white/70 transition-colors">
              <Home className="w-4 h-4" />
            </button>
          </div>

          {/* URL Bar */}
          <form onSubmit={handleUrlSubmit} className="flex-1 relative group">
            <div className="flex items-center gap-2 bg-black/40 rounded-full px-4 py-1.5 border border-white/5 group-focus-within:border-blue-500/50 group-focus-within:ring-2 group-focus-within:ring-blue-500/20 transition-all">
              {getSecurityIcon()}
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder={t('browser.searchPlaceholder')}
                className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-white/30"
              />
              <button
                type="button"
                onClick={toggleBookmark}
                className="focus:outline-none"
              >
                <Star
                  className={cn(
                    "w-3.5 h-3.5 cursor-pointer transition-colors",
                    isBookmarked ? "text-yellow-400 fill-yellow-400" : "text-white/30 hover:text-white/80"
                  )}
                />
              </button>
            </div>
          </form>
        </div>

        {/* Bookmark Bar (Visible only if bookmarks exist) */}
        {appState.bookmarks.length > 0 && (
          <div className="flex items-center px-3 pb-2 gap-2 overflow-x-auto no-scrollbar">
            {appState.bookmarks.map((url, idx) => {
              const details = getBookmarkDetails(url);
              return (
                <button
                  key={idx}
                  onClick={() => navigate(url)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/10 text-xs text-white/80 transition-colors whitespace-nowrap max-w-[150px]"
                >
                  <Globe className="w-3 h-3 text-blue-400" />
                  <span className="truncate">{details.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading Bar */}
      {activeTab.isLoading && (
        <div className="absolute top-[53px] left-0 w-full h-0.5 bg-transparent z-30 pointer-events-none">
          <div
            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all ease-out duration-300"
            style={{ width: `${activeTab.progress}%` }}
          />
        </div>
      )}

      {/* Website Content */}
      <div className={cn("flex-1 overflow-y-auto relative h-full safe-scroll browser-scrollbar", (activeTab.renderedUrl === 'browser://welcome' || (!wifiEnabled || !currentNetwork) && !activeTab.renderedUrl.startsWith('browser://')) ? "bg-transparent" : "bg-white")}>
        {(!wifiEnabled || !currentNetwork) && !activeTab.renderedUrl.startsWith('browser://') ? (
          <div className="h-full flex items-center justify-center p-4">
            <div
              className="w-full max-w-sm border border-white/10 rounded-xl shadow-2xl transition-all duration-300"
              style={{
                background: getBackgroundColor(0.8),
                ...blurStyle,
                boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5)`
              }}
            >
              <EmptyState
                icon={WifiOff}
                title={t('browser.error.offlineTitle') || "No Internet Connection"}
                description={t('browser.error.offlineDesc') || "You are not connected to the internet. Please connect to a network to browse the web."}
                action={
                  <GlassButton
                    onClick={() => navigate(activeTab.renderedUrl)}
                    className="w-full justify-center font-medium transition-all hover:brightness-110 mt-2"
                    style={{ backgroundColor: accentColor }}
                  >
                    Try Again
                  </GlassButton>
                }
                className="p-8"
              />
            </div>
          </div>
        ) : currentWebsite && WebsiteComponent ? (
          <WebsiteComponent
            domain={currentWebsite.domain}
            onNavigate={navigate}
            params={getParams()}
            owner={owner}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center max-w-md text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
              <h1 className="text-xl font-bold mb-2">{t('browser.error.pageNotFound')}</h1>
              <p className="text-white/50 mb-6 text-sm">
                {t('browser.error.pageNotFoundDesc', { url: activeTab.renderedUrl })}
              </p>
              <button onClick={goHome} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors text-sm font-medium">
                {t('browser.error.goHome')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return <AppTemplate toolbar={TabBar} content={content} hasSidebar={false} contentClassName="overflow-hidden" />;
}
