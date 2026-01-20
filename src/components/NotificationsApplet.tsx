import { useState, useMemo } from 'react';
import { Bell, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppContext } from '@/components/AppContext';
import { useI18n } from '@/i18n';
import { useAppNotifications, type AppNotification } from '@/components/AppNotificationsContext';

import { getApp } from '@/config/appRegistry';

interface NotificationsAppletProps {
  onOpenApp?: (appId: string, data?: Record<string, unknown>, owner?: string) => void;
}

// Memoized Notification Item to prevent re-renders of the entire list
const NotificationItem = ({ notification, accentColor, t, timeMode, onRemove, onClick }: { 
    notification: AppNotification, 
    accentColor: string, 
    t: (key: string) => string,
    timeMode: 'server' | 'local',
    onRemove: (id: string) => void,
    onClick: (id: string, appId: string, data?: Record<string, unknown>, owner?: string) => void
}) => {
    return (
        <motion.div
            layout // Use layout animation for smooth sorting/filtering
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`p-3 transition-colors relative group border-b border-white/5 last:border-0 ${notification.unread ? 'bg-white/5' : 'hover:bg-white/5'}`}
            onClick={(e) => {
                e.stopPropagation();
                onClick(notification.id, notification.appId, notification.data, notification.owner);
            }}
        >
            <div className="flex gap-3">
                <div className="flex-1 min-w-0 pr-6 pl-1">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm text-white/90 font-medium truncate">{notification.title}</h3>
                        <div className="flex items-center gap-2 shrink-0">
                            {notification.unread && (
                                <span className="text-[10px] px-1.5 py-[2px] rounded-full text-black font-bold" style={{ backgroundColor: accentColor }}>
                                    {t('notifications.new') || 'New'}
                                </span>
                            )}
                            <span className="text-[10px] text-white/35">
                                {new Date(notification.createdAt).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    timeZone: timeMode === 'server' ? 'UTC' : undefined 
                                })}
                            </span>
                        </div>
                    </div>
                    {notification.message && (
                        <p className="text-xs text-white/60 mt-1 line-clamp-2 leading-relaxed">{notification.message}</p>
                    )}
                </div>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(notification.id);
                }}
                className="absolute top-3 right-2 p-1 rounded-full hover:bg-white/10 text-white/30 hover:text-white/80 transition-all opacity-0 group-hover:opacity-100"
                title={t('notifications.subtitles.deleted') || "Delete"}
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </motion.div>
    );
};

export function NotificationsApplet({ onOpenApp }: NotificationsAppletProps) {
  const { accentColor, reduceMotion, disableShadows, timeMode } = useAppContext();
  const { blurStyle, getBackgroundColor } = useThemeColors();
  const { t } = useI18n();
  const { notifications, unreadCount, markRead, clearAll, remove } = useAppNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Group notifications by appId
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, AppNotification[]> = {};
    notifications.forEach(n => {
      if (!groups[n.appId]) groups[n.appId] = [];
      groups[n.appId].push(n);
    });
    return groups;
  }, [notifications]);

  // Determine default expanded (newest)
  const defaultExpanded = useMemo(() => {
      if (notifications.length === 0) return [];
      const latest = notifications.reduce((prev, curr) => 
          new Date(curr.createdAt).getTime() > new Date(prev.createdAt).getTime() ? curr : prev
      , notifications[0]);
      return [latest.appId];
  }, [notifications]);

  const clearGroup = (appId: string) => {
      const ids = groupedNotifications[appId]?.map(n => n.id) || [];
      ids.forEach(id => remove(id));
  };

  const handleNotificationClick = (id: string, appId: string, data: Record<string, unknown> | undefined, owner: string | undefined) => {
    if (appId && onOpenApp) {
      markRead(id);
      onOpenApp(appId, data, owner);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`transition-colors relative flex items-center justify-center ${isOpen ? 'text-white' : 'text-white/70 hover:text-white'}`}
          aria-label={t('notifications.title') || 'Notifications'}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 text-[10px] leading-none rounded-full px-1.5 py-[2px] text-black"
              style={{ backgroundColor: accentColor }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className={`w-96 p-0 overflow-hidden border-white/20 rounded-2xl select-none ${!disableShadows ? 'shadow-2xl' : 'shadow-none'} ${reduceMotion ? 'animate-none! duration-0!' : ''}`}
        style={{ background: getBackgroundColor(0.8), ...blurStyle }}
        align="end"
        sideOffset={12}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-white/70" />
            <h2 className="text-white/90 font-semibold">{t('notifications.title')}</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[500px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-white/50 text-sm text-center">{t('notifications.empty')}</div>
          ) : (
            <div className="p-2 space-y-2">
              <Accordion 
                type="multiple" 
                defaultValue={defaultExpanded} 
                className="space-y-2"
              >
                {Object.entries(groupedNotifications).map(([appId, appNotifications]) => {
                  const app = getApp(appId);
                  const AppIcon = app?.icon || Bell;
                  const appName = app?.nameKey ? t(app.nameKey) : (app?.name || appId);
                  
                  const appUnreadCount = appNotifications.filter(n => n.unread).length;
                  const isGroupUnread = appUnreadCount > 0;
                  
                  return (
                    <AccordionItem 
                        key={appId} 
                        value={appId} 
                        className={`border border-white/10 rounded-xl overflow-hidden transition-all ${
                            isGroupUnread ? 'bg-black/20' : 'bg-black/40 opacity-70'
                        }`}
                    >
                      <div className="flex items-center justify-between pr-2 border-b border-white/5 bg-white/5">
                        <AccordionTrigger className="flex-1 px-3 py-2 text-sm text-white/90 hover:no-underline hover:bg-white/5 transition-colors">
                           <div className="flex items-center gap-2">
                             <AppIcon className={`w-4 h-4 ${isGroupUnread ? 'text-white/90' : 'text-white/50'}`} />
                             <span className={`font-medium ${isGroupUnread ? 'text-white/90' : 'text-white/70'}`}>{appName}</span>
                             {isGroupUnread && (
                                <span className="text-[10px] bg-accent/20 px-1.5 py-0.5 rounded-full text-accent font-bold" style={{ color: accentColor, backgroundColor: `${accentColor}33` }}>
                                    {appUnreadCount}
                                </span>
                             )}
                           </div>
                        </AccordionTrigger>
                        <button
                          onClick={(e) => {
                             e.stopPropagation();
                             clearGroup(appId);
                          }}
                          className="p-1.5 mr-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                          title={t('notifications.clearApp')}
                        >
                           <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <AccordionContent className="p-0">
                         {/* Removed AnimatePresence wrapper around list, kept it inside Item or simplified */}
                         <div className="divide-y divide-white/5">
                             {appNotifications.map((notification) => (
                               <NotificationItem 
                                  key={notification.id}
                                  notification={notification}
                                  accentColor={accentColor}
                                  t={t}
                                  timeMode={timeMode}
                                  onRemove={remove}
                                  onClick={handleNotificationClick}
                               />
                             ))}
                         </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-black/40 border-t border-white/5">
          <button
            className="w-full text-sm hover:opacity-80 transition-opacity"
            style={{ color: accentColor }}
            onClick={() => clearAll()}
          >
            {t('notifications.clearAll')}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
