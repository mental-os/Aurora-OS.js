import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAppContext } from '@/components/AppContext';

/**
 * Mental Model: App Notifications
 * 
 * Notifications carry three key pieces of context:
 * - appId: which app the notification originates from
 * - owner: which user/tenant owns this notification (enables multi-user and later remote/server contexts)
 * - data: the specific item the notification is about (e.g., { emailId: '123' }, { messageId: 'msg_456' })
 * 
 * When a user clicks a notification:
 * - The app opens via openWindow(appId, data, owner)
 * - The app receives the data payload and can focus/navigate to the exact item
 * - This supports: email from X, message from Y, server event Z, etc.
 * - Future: enables notifications from remote computers, servers, tenants
 */
export interface AppNotification {
  id: string;
  appId: string;
  owner: string; // User/tenant that owns this notification
  title: string;
  message: string;
  createdAt: number; // ms since epoch
  data?: Record<string, unknown>; // The specific item this notification is about
  unread: boolean;
}

interface AppNotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  push: (n: Omit<AppNotification, 'id' | 'createdAt' | 'unread'>) => AppNotification;
  markRead: (id: string) => void;
  remove: (id: string) => void;
  clearAll: () => void;
}

const AppNotificationsContext = createContext<AppNotificationsContextType | null>(null);

export function useAppNotifications() {
  const ctx = useContext(AppNotificationsContext);
  if (!ctx) throw new Error('useAppNotifications must be used within AppNotificationsProvider');
  return ctx;
}

function storageKeyFor(user: string) {
  return `aurora-app-notifications-${user}`;
}

export function AppNotificationsProvider({ children }: { children: React.ReactNode }) {
  const { activeUser } = useAppContext();
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const raw = localStorage.getItem(storageKeyFor(activeUser));
      if (!raw) return [];
      const parsed = JSON.parse(raw) as AppNotification[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Reload notifications when active user changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKeyFor(activeUser));
      const parsed = raw ? (JSON.parse(raw) as AppNotification[]) : [];
      setNotifications(Array.isArray(parsed) ? parsed : []);
    } catch {
      setNotifications([]);
    }
  }, [activeUser]);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(storageKeyFor(activeUser), JSON.stringify(notifications));
    } catch {
      /* ignore storage errors */
    }
  }, [notifications, activeUser]);

  const push = useCallback<AppNotificationsContextType['push']>((n) => {
    const item: AppNotification = {
      id: `${n.appId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      appId: n.appId,
      owner: n.owner,
      title: n.title,
      message: n.message,
      createdAt: Date.now(),
      data: n.data,
      unread: true,
    };
    setNotifications((prev) => [item, ...prev].slice(0, 100)); // Keep last 100
    return item;
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications]);

  const value = useMemo(
    () => ({ notifications, unreadCount, push, markRead, remove, clearAll }),
    [notifications, unreadCount, push, markRead, remove, clearAll]
  );

  return (
    <AppNotificationsContext.Provider value={value}>{children}</AppNotificationsContext.Provider>
  );
}
