import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useThemeColors } from '../hooks/useThemeColors';
import { useAppContext } from './AppContext';
import { useI18n } from '../i18n';
import { useAppNotifications } from './AppNotificationsContext';

interface NotificationsAppletProps {
  onOpenApp?: (appId: string, data?: Record<string, unknown>, owner?: string) => void;
}

export function NotificationsApplet({ onOpenApp }: NotificationsAppletProps) {
  const { accentColor, reduceMotion, disableShadows } = useAppContext();
  const { blurStyle, getBackgroundColor } = useThemeColors();
  const { t } = useI18n();
  const { notifications, unreadCount, markRead, clearAll } = useAppNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (appId: string, data: Record<string, unknown> | undefined, owner: string | undefined) => {
    if (appId && onOpenApp) {
      markRead(appId);
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
        className={`w-96 p-0 overflow-hidden border-white/20 rounded-2xl ${!disableShadows ? 'shadow-2xl' : 'shadow-none'} ${reduceMotion ? 'animate-none! duration-0!' : ''}`}
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
        <div className="max-h-[500px] overflow-y-auto divide-y divide-white/5">
          {notifications.length === 0 ? (
            <div className="p-6 text-white/50 text-sm text-center">{t('notifications.empty') || 'No notifications'}</div>
          ) : (
            <AnimatePresence>
              {notifications.map((notification, idx) => (
                <motion.div
                  key={notification.id}
                  className={`p-4 transition-colors cursor-pointer ${notification.unread ? 'bg-white/[0.04]' : 'hover:bg-white/[0.03]'}`}
                  initial={{ opacity: 0, x: reduceMotion ? 0 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduceMotion ? 0 : idx * 0.05 }}
                  onClick={() => handleNotificationClick(notification.appId, notification.data, notification.owner)}
                >
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 shrink-0" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm text-white/90 font-medium truncate">{notification.title}</h3>
                        {notification.unread && (
                          <span className="text-[10px] px-1.5 py-[2px] rounded-full text-black" style={{ backgroundColor: accentColor }}>
                            {t('notifications.new') || 'New'}
                          </span>
                        )}
                      </div>
                      {notification.message && (
                        <p className="text-xs text-white/60 mt-1 line-clamp-2">{notification.message}</p>
                      )}
                      <div className="text-[10px] text-white/35 mt-1">
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
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
