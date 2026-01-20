import { useState } from 'react';
import { type AppMetadata } from '@/config/appRegistry';
import { Button } from '@/components/ui/button';
import { AppIcon } from '@/components/ui/AppIcon';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Download, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { useI18n } from '@/i18n/index';
import { useAppContext } from '@/components/AppContext';
import { useThemeColors } from '@/hooks/useThemeColors';

interface AppCardProps {
    app: AppMetadata;
    isInstalled: boolean;
    isInstalling: boolean;
    progress?: number;
    isBroken?: boolean; // New prop for restore
    onInstall: (appId: string, size?: number) => void;
    onUninstall: (appId: string) => void;
    onRestore?: (appId: string) => void; // New callback
    onOpenApp?: (type: string, data?: any, owner?: string) => void;
}

export function AppCard({ 
    app, 
    isInstalled, 
    isInstalling, 
    progress = 0, 
    isBroken = false,
    onInstall, 
    onUninstall,
    onRestore,
    onOpenApp
}: AppCardProps) {
    const { t } = useI18n();
    const { accentColor } = useAppContext();
    const { getBackgroundColor, blurStyle } = useThemeColors();
    const [showUninstallConfirm, setShowUninstallConfirm] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const displayName = app.nameKey ? t(app.nameKey) : app.name;
    const displayDescription = app.descriptionKey ? t(app.descriptionKey) : app.description;

    return (
        <Card 
            className="flex flex-col border border-white/20 transition-colors gap-0 h-fit rounded-xl overflow-hidden shadow-lg"
            style={{
                background: getBackgroundColor(0.8),
                // Core apps get a strong white border (as requested)
                // Installed user apps get accent color
                // Broken apps get warning color (orange/amber)
                // Others get default subtle border
                borderColor: isBroken 
                    ? '#f59e0b' 
                    : (app.isCore ? 'rgba(0, 0, 0, 0)' : (isInstalled ? accentColor : undefined)),
                ...blurStyle
            }}
        >
            <CardHeader className="flex-row items-center gap-3 space-y-0 p-3 pb-0">
                <AppIcon app={app} size="md" className="rounded-lg" />
                <div className="flex-1 min-w-0 flex flex-col gap-0">
                    <CardTitle className="text-white text-sm font-semibold truncate leading-tight">
                        {displayName}
                    </CardTitle>
                    <CardDescription className="text-white/50 text-[10px] uppercase tracking-wide">
                        {t(`appStore.categories.${app.category}`)}
                        {!app.isCore && (
                            <>
                                <span className="mx-1.5 opacity-30">|</span>
                                <span className="font-mono tracking-wider">
                                     {app.size ? `${app.size} MB` : t('appStore.sizeUnknown')}
                                </span>
                            </>
                        )}
                        {isBroken && (
                             <span className="ml-2 text-amber-500 font-bold uppercase tracking-wider text-[9px] border border-amber-500/50 px-1 py-0.5 rounded" title={t('appStore.checkFailedTitle')}>
                                 {t('appStore.checkFailed')}
                             </span>
                        )}
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="p-3 pt-2 pb-2 flex flex-col gap-2">
                <p className="text-white/60 text-xs line-clamp-2 leading-relaxed">
                    {displayDescription}
                </p>
            </CardContent>

            {!app.isCore && (
                <CardFooter className="p-3 pt-0 mt-auto">
                    {isInstalling ? (
                        // Progress Bar
                        <div className="w-full h-7 bg-white/5 rounded-md overflow-hidden relative border border-white/10">
                            <div
                                className="h-full transition-all duration-200 ease-out"
                                style={{
                                    width: `${progress}%`,
                                    backgroundColor: accentColor,
                                    opacity: 0.9
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                                {progress}%
                            </div>
                        </div>
                    ) : isInstalled ? (
                         isBroken ? (
                            // Restore Button
                            <Button
                                onClick={() => onRestore?.(app.id)}
                                size="sm"
                                className="w-full h-7 text-xs bg-transparent border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                            >
                                <RefreshCw className="mr-1.5 w-3 h-3" />
                                {t('appStore.restore')}
                            </Button>
                         ) : showUninstallConfirm ? (
                            <div className="flex items-center gap-2 w-full animate-in fade-in duration-200">
                                 <Button
                                    onClick={() => setShowUninstallConfirm(false)}
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 h-7 text-xs text-white/50 hover:text-white hover:bg-white/10"
                                >
                                    {t('appStore.cancel')}
                                </Button>
                                <Button
                                    onClick={() => {
                                        onUninstall(app.id);
                                        setShowUninstallConfirm(false);
                                    }}
                                    size="sm"
                                    className="flex-1 h-7 text-xs bg-red-500 hover:bg-red-600 text-white shadow-sm"
                                >
                                    {t('appStore.confirm')}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 w-full">
                                <Button
                                    onClick={() => onOpenApp?.(app.id, undefined, undefined)} // activeUser/owner handled by OS
                                    size="sm"
                                    className="flex-1 h-7 text-xs text-white shadow-sm transition-all active:scale-95 hover:brightness-110"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    <ExternalLink className="mr-1.5 w-3 h-3" />
                                    {t('appStore.open')}
                                </Button>
                                <Button
                                    onClick={() => setShowUninstallConfirm(true)}
                                    variant="ghost" 
                                    size="sm"
                                    className="h-7 w-7 p-0 shrink-0 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent transition-all rounded-md"
                                    title={t('appStore.uninstall')}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        )
                    ) : (
                      <Button
                            onClick={() => onInstall(app.id, app.size)}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            variant="ghost"
                            size="sm"
                            className="w-full h-7 text-xs border transition-all active:scale-95 duration-200"
                            style={{
                                borderColor: accentColor,
                                backgroundColor: isHovered ? accentColor : 'transparent',
                                color: isHovered ? '#fff' : accentColor
                            }}
                        >
                            <Download className="mr-1.5 w-3 h-3" />
                            {t('appStore.install')}
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}

