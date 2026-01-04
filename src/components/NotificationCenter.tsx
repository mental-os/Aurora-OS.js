import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Mail, MessageSquare, Download, Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useAppContext } from './AppContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { useState } from 'react';
import { useI18n } from '../i18n';

export function NotificationCenter() {
  const { accentColor, reduceMotion, disableShadows } = useAppContext();
  const { blurStyle, getBackgroundColor } = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();

  const notifications = [
    {
      id: 1,
      icon: Mail,
      title: t('notifications.items.newEmail.title'),
      message: t('notifications.items.newEmail.message', { count: 3 }),
      time: t('notifications.time.minutesAgo', { minutes: 5 }),
      color: 'text-blue-500',
    },
    {
      id: 2,
      icon: Calendar,
      title: t('notifications.items.meetingReminder.title'),
      message: t('notifications.items.meetingReminder.message', { minutes: 15 }),
      time: t('notifications.time.minutesAgo', { minutes: 10 }),
      color: 'text-red-500',
    },
    {
      id: 3,
      icon: MessageSquare,
      title: t('notifications.items.newMessage.title'),
      message: t('notifications.items.newMessage.message', { sender: 'Sarah' }),
      time: t('notifications.time.hoursAgo', { hours: 1 }),
      color: 'text-green-500',
    },
    {
      id: 4,
      icon: Download,
      title: t('notifications.items.downloadComplete.title'),
      message: t('notifications.items.downloadComplete.message', { filename: 'project-files.zip' }),
      time: t('notifications.time.hoursAgo', { hours: 2 }),
      color: 'text-purple-500',
    },
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`transition-colors ${isOpen ? 'text-white' : 'text-white/70 hover:text-white'}`}
        >
          <Bell className="w-4 h-4" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className={`w-96 p-0 overflow-hidden border-white/20 rounded-2xl ${!disableShadows ? 'shadow-2xl' : 'shadow-none'} ${reduceMotion ? '!animate-none !duration-0' : ''}`}
        style={{ background: getBackgroundColor(0.8), ...blurStyle }}
        align="end"
        sideOffset={12}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-white/70" />
            <h2 className="text-white/90">{t('notifications.title')}</h2>
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
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                initial={{ opacity: 0, x: reduceMotion ? 0 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduceMotion ? 0 : notification.id * 0.05 }}
              >
                <div className="flex gap-3">
                  <div className={`flex-shrink-0 ${notification.color}`}>
                    <notification.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm text-white/90">
                        {notification.title}
                      </h3>
                      <span className="text-xs text-white/40 whitespace-nowrap">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-3 bg-black/40 border-t border-white/5">
          <button
            className="w-full text-sm hover:opacity-80 transition-opacity"
            style={{ color: accentColor }}
          >
            {t('notifications.clearAll')}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}