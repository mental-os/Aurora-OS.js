import { motion, AnimatePresence } from 'motion/react';
import { X, Bell } from 'lucide-react';
import { AppNotification } from '@/components/AppNotificationsContext';
import { getApp } from '@/config/appRegistry';
import { useThemeColors } from '@/hooks/useThemeColors';

interface HeadsUpStackProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onOpen: (appId: string, data?: Record<string, unknown>, owner?: string) => void;
}

export function HeadsUpStack({ notifications, onDismiss, onOpen }: HeadsUpStackProps) {
  const { getBackgroundColor, blurStyle } = useThemeColors();

  return (
    <div className="fixed top-14 right-4 z-9999 flex flex-col gap-2 pointer-events-none w-80 select-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => {
          const app = getApp(notification.appId);
          const Icon = app?.icon || Bell;
          
          return (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto overflow-hidden rounded-xl border border-white/10 shadow-2xl backdrop-blur-xl"
              style={{ background: getBackgroundColor(0.8), ...blurStyle }}
            >
              <div className="p-4 flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10 text-white/80">
                  <Icon className="w-5 h-5" />
                </div>
                <div 
                  className="flex-1 min-w-0 py-0.5 cursor-pointer" 
                  onClick={(e) => { 
                    e.stopPropagation();
                    onOpen(notification.appId, notification.data, notification.owner); 
                    onDismiss(notification.id); 
                  }}
                >
                  <h3 className="font-medium text-white text-sm truncate">{notification.title}</h3>
                  <p className="text-white/60 text-xs mt-0.5 line-clamp-2">{notification.message}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDismiss(notification.id); }}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
