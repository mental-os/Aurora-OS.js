
import { CircleCheck, FileWarning, TriangleAlert } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';

interface SystemToastProps {
    type: 'success' | 'warning' | 'error';
    source: string;
    message: React.ReactNode;
    subtitle?: string;
    appId?: string;
    onOpenApp?: (appId: string) => void;
}

export function SystemToast({ type, source, message, subtitle, appId, onOpenApp }: SystemToastProps) {
    const { notificationBackground, blurStyle } = useThemeColors();

    const icons = {
        success: <CircleCheck className="w-4 h-4 text-green-400" />,
        warning: <TriangleAlert className="w-4 h-4 text-yellow-400" />,
        error: <FileWarning className="w-4 h-4 text-red-500" />, // Kept red-500 for visibility
    };

    const handleClick = () => {
        if (appId && onOpenApp) {
            onOpenApp(appId);
        }
    };

    return (
        <div
            className={`w-full p-3 rounded-xl border border-white/10 shadow-2xl transition-all duration-300 pointer-events-auto select-none ${
                appId && onOpenApp ? 'cursor-pointer hover:bg-white/5' : ''
            }`}
            style={{
                backgroundColor: notificationBackground,
                ...blurStyle
            }}
            onClick={handleClick}
        >
            <div className="flex items-center gap-2.5">
                {icons[type]}
                <span className="text-[13px] font-semibold text-white tracking-wide flex-1">
                    {source}
                </span>
                <span className="text-[11px] text-white/40 font-medium">{subtitle || 'now'}</span>
            </div>
            <div className="text-[13px] text-white/70 leading-snug mt-1 pl-[26px]">
                {message}
            </div>
        </div>
    );
}
