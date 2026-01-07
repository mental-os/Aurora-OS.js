import { useState, useMemo, useRef, useEffect } from 'react';
import { AppTemplate } from './AppTemplate';
import { useFileSystem } from '../FileSystemContext';
import { getAllApps, getAppsByCategory, type AppMetadata } from '../../config/appRegistry';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Download, Trash2, Check } from 'lucide-react';
import { cn } from '../ui/utils';
import { AppIcon } from '../ui/AppIcon';
import { EmptyState } from '../ui/empty-state';
import { useAppContext } from '../AppContext';
import { useI18n } from '../../i18n/index';

interface AppStoreProps {
    owner?: string;
}

export function AppStore({ owner }: AppStoreProps) {
    const { installedApps, installApp, uninstallApp } = useFileSystem();
    const { accentColor } = useAppContext();
    const { t } = useI18n();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | AppMetadata['category']>('all');
    const [installingApps, setInstallingApps] = useState<Record<string, number>>({});

    // We use a ref to track active timeouts so we can clear them on unmount
    const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
    // We also need to track current progress in a ref to avoid stale closures in the recursive timeout
    const progressRef = useRef<Record<string, number>>({});

    const categories: Array<{ id: 'all' | AppMetadata['category']; label: string }> = [
        { id: 'all', label: t('appStore.categories.all') },
        { id: 'productivity', label: t('appStore.categories.productivity') },
        { id: 'media', label: t('appStore.categories.media') },
        { id: 'utilities', label: t('appStore.categories.utilities') },
        { id: 'development', label: t('appStore.categories.development') },
        { id: 'system', label: t('appStore.categories.system') },
    ];

    // Cleanup timeouts on unmount
    useEffect(() => {
        const timeouts = timeoutsRef.current;
        return () => {
            Object.values(timeouts).forEach(clearTimeout);
        };
    }, []);

    // Filter apps based on search and category
    const filteredApps = useMemo(() => {
        let apps = selectedCategory === 'all'
            ? getAllApps()
            : getAppsByCategory(selectedCategory);

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            apps = apps.filter(app =>
                (app.nameKey ? t(app.nameKey) : app.name).toLowerCase().includes(query) ||
                (app.descriptionKey ? t(app.descriptionKey) : app.description).toLowerCase().includes(query)
            );
        }

        return apps;
    }, [searchQuery, selectedCategory, t]);

    const handleInstall = (appId: string, appSize: number = 50) => {
        // If already installing, ignore
        if (installingApps[appId] !== undefined) return;

        // Initialize state
        setInstallingApps(prev => ({ ...prev, [appId]: 0 }));
        progressRef.current[appId] = 0;

        // Base speed factor: Larger apps = slower
        // 50MB is "standard". 350MB is ~7x slower.
        // We want a base update speed.
        // Let's say we target ~2-3 seconds for a standard app.
        const speedFactor = Math.max(1, Math.min(10, appSize / 20));

        const loop = () => {
            const currentProgress = progressRef.current[appId];

            if (currentProgress >= 100) {
                // Final pause before actual install
                timeoutsRef.current[appId] = setTimeout(() => {
                    installApp(appId, owner);

                    // Cleanup
                    delete timeoutsRef.current[appId];
                    delete progressRef.current[appId];

                    setInstallingApps(prev => {
                        const next = { ...prev };
                        delete next[appId];
                        return next;
                    });
                }, 500);
                return;
            }

            // Variable increment: 1% to 4%
            const increment = Math.random() * 3 + 1;
            const newProgress = Math.min(100, currentProgress + increment);

            progressRef.current[appId] = newProgress;
            setInstallingApps(prev => ({ ...prev, [appId]: Math.floor(newProgress) }));

            // Variable delay logic
            // Base delay ~30ms * speedFactor
            // Random Jitter 0.5 - 1.5
            const jitter = Math.random() + 0.5;
            let delay = 30 * speedFactor * jitter;

            // "Stall" simulation
            // At 85-95%, occasional long pause
            if (newProgress > 85 && newProgress < 95 && Math.random() > 0.8) {
                delay += 800;
            }

            timeoutsRef.current[appId] = setTimeout(loop, delay);
        };

        // Start
        timeoutsRef.current[appId] = setTimeout(loop, 100);
    };

    const handleUninstall = (appId: string) => {
        uninstallApp(appId, owner);
    };

    return (
        <AppTemplate
            hasSidebar={false}
            toolbar={
                <div className="flex items-center gap-4 w-full">
                    {/* Search Bar */}
                    <div className="flex-1 max-w-md relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                            type="text"
                            placeholder={t('appStore.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-8 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                                    selectedCategory === cat.id
                                        ? "text-white"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                )}
                                style={selectedCategory === cat.id ? { backgroundColor: accentColor } : {}}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            }
            content={
                <div className="p-6 overflow-y-auto h-full">
                    {filteredApps.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <EmptyState
                                icon={Search}
                                title={t('appStore.empty.title')}
                                description={t('appStore.empty.description')}
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredApps.map((app) => {
                                const isInstalled = installedApps.has(app.id);
                                const progress = installingApps[app.id];
                                const isInstalling = progress !== undefined;
                                const displayName = app.nameKey ? t(app.nameKey) : app.name;
                                const displayDescription = app.descriptionKey ? t(app.descriptionKey) : app.description;

                                return (
                                    <div
                                        key={app.id}
                                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                                    >
                                        {/* App Icon & Name */}
                                        <div className="flex items-start gap-4 mb-3">
                                            <AppIcon app={app} size="lg" />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-semibold text-lg mb-1">{displayName}</h3>
                                                <p className="text-white/60 text-xs uppercase tracking-wide">{t(`appStore.categories.${app.category}`)}</p>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-white/70 text-sm line-clamp-2">{displayDescription}</p>

                                        {/* Metadata (Size) */}
                                        <p className="text-white/30 text-[10px] uppercase tracking-wider font-mono mb-4">
                                            {t('appStore.size')}: {app.size ? `${app.size} MB` : t('appStore.sizeUnknown')}
                                        </p>

                                        {/* Install/Uninstall/Progress Button */}
                                        <div className="flex items-center gap-2 h-9">
                                            {app.isCore ? (
                                                <div className="flex items-center gap-2 text-white/40 text-sm">
                                                    <Check className="w-4 h-4" />
                                                    <span>{t('appStore.systemApp')}</span>
                                                </div>
                                            ) : isInstalling ? (
                                                // Progress Bar UI
                                                <div className="flex-1 h-9 bg-white/5 rounded-md overflow-hidden relative border border-white/10">
                                                    <div
                                                        className="h-full transition-all duration-200 ease-out"
                                                        style={{
                                                            width: `${progress}%`,
                                                            backgroundColor: accentColor,
                                                            opacity: 0.9
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                                                        {progress}%
                                                    </div>
                                                </div>
                                            ) : isInstalled ? (
                                                <Button
                                                    onClick={() => handleUninstall(app.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex items-center gap-2 border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/40"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    {t('appStore.uninstall')}
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleInstall(app.id, app.size)}
                                                    size="sm"
                                                    className="flex items-center gap-2 text-white shadow-sm"
                                                    style={{ backgroundColor: accentColor }}
                                                >
                                                    <Download className="w-4 h-4" />
                                                    {t('appStore.install')}
                                                </Button>
                                            )}

                                            {isInstalled && !app.isCore && !isInstalling && (
                                                <div className="flex items-center gap-1 text-green-400 text-xs ml-auto">
                                                    <Check className="w-3 h-3" />
                                                    {t('appStore.installed')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                    }
                </div>
            }
        />
    );
}

import { AppMenuConfig } from '../../types';

export const appStoreMenuConfig: AppMenuConfig = {
    menus: ['File', 'Edit', 'Store', 'Window', 'Help'],
    items: {
        'Store': [
            { label: 'Reload', labelKey: 'menubar.items.reload', shortcut: '⌘R', action: 'reload' },
            { type: 'separator' },
            { label: 'Check for Updates...', labelKey: 'appStore.menu.checkForUpdates', action: 'check-updates' },
            { label: 'View My Account', labelKey: 'appStore.menu.viewMyAccount', action: 'view-account' }
        ]
    }
};