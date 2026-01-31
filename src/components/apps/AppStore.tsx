import { useState, useMemo } from 'react';
import { AppTemplate } from './AppTemplate';
import { getAllApps, getAppsByCategory, type AppMetadata } from '@/config/appRegistry';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';
import { cn } from '../ui/utils';
import { EmptyState } from '../ui/empty-state';
import { useAppContext } from '../AppContext';
import { useI18n } from '@/i18n/index';
import { useAppInstaller } from '@/hooks/useAppInstaller';
import { AppCard } from './AppStore/AppCard';
import { ResponsiveGrid } from '../ui/ResponsiveGrid';
import { useWindow } from '@/components/WindowContext';
import { useEffect, useRef } from 'react';
import { notify } from '@/services/notifications';

interface AppStoreProps {
    owner?: string;
    onOpenApp?: (type: string, data?: any, owner?: string) => void;
}

export function AppStore({ owner, onOpenApp }: AppStoreProps) {
    const { accentColor } = useAppContext();
    const { t } = useI18n();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | AppMetadata['category']>('all');

    // Use custom installer hook
    const { installingApps, handleInstall, handleUninstall, cancelInstall, isAppInstalled, isAppBroken, handleRestore } = useAppInstaller({ owner });
    const windowContext = useWindow();

    // Prevent window close if installing
    const installingAppsCount = Object.keys(installingApps).length;
    const installingAppsRef = useRef(installingAppsCount);
    
    useEffect(() => {
        installingAppsRef.current = installingAppsCount;
    }, [installingAppsCount]);

    useEffect(() => {
        if (!windowContext) return;
        
        windowContext.setBeforeClose(() => async () => {
            if (installingAppsRef.current > 0) {
                 notify.system(
                    'warning',
                    'App Store',
                    t('appStore.installingWarning'),
                    t('notifications.subtitles.warning')
                );
                return false;
            }
            return true;
        });

        return () => windowContext.setBeforeClose(null);
    }, [windowContext, t]);

    const categories: Array<{ id: 'all' | AppMetadata['category']; label: string }> = [
        { id: 'all', label: t('appStore.categories.all') },
        { id: 'productivity', label: t('appStore.categories.productivity') },
        { id: 'media', label: t('appStore.categories.media') },
        { id: 'utilities', label: t('appStore.categories.utilities') },
        { id: 'development', label: t('appStore.categories.development') },
        { id: 'system', label: t('appStore.categories.system') },
    ];

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
                            className="pl-10 h-8 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 transition-colors"
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
                                        ? "text-white shadow-sm"
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
                        <ResponsiveGrid minItemWidth={240} gap={4}>
                            {filteredApps.map((app) => (
                                <AppCard
                                    key={app.id}
                                    app={app}
                                    isInstalled={isAppInstalled(app.id)}
                                    // Use hook functions
                                    isBroken={isAppBroken ? isAppBroken(app.id) : false}
                                    isInstalling={installingApps[app.id] !== undefined}
                                    progress={installingApps[app.id]}
                                    onInstall={handleInstall}
                                    onUninstall={handleUninstall}
                                    onCancel={cancelInstall} // Passing cancelInstall
                                    onRestore={handleRestore}
                                    onOpenApp={onOpenApp}
                                />
                            ))}
                        </ResponsiveGrid>
                    )}
                </div>
            }
        />
    );
}

import { AppMenuConfig } from '@/types';

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
