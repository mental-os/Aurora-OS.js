import { useState, useMemo } from 'react';
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
import { useI18n } from '../../i18n';

interface AppStoreProps {
    owner?: string;
}

export function AppStore({ owner }: AppStoreProps) {
    const { installedApps, installApp, uninstallApp } = useFileSystem();
    const { accentColor } = useAppContext();
    const { t } = useI18n();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | AppMetadata['category']>('all');

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
                app.name.toLowerCase().includes(query) ||
                app.description.toLowerCase().includes(query)
            );
        }

        return apps;
    }, [searchQuery, selectedCategory]);

    const handleInstall = (appId: string) => {
        installApp(appId, owner);
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

                                return (
                                    <div
                                        key={app.id}
                                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                                    >
                                        {/* App Icon & Name */}
                                        <div className="flex items-start gap-4 mb-3">
                                            <AppIcon app={app} size="lg" />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-semibold text-lg mb-1">{app.name}</h3>
                                                <p className="text-white/60 text-xs uppercase tracking-wide">{t(`appStore.categories.${app.category}`)}</p>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-white/70 text-sm mb-4 line-clamp-2">{app.description}</p>

                                        {/* Install/Uninstall Button */}
                                        <div className="flex items-center gap-2">
                                            {app.isCore ? (
                                                <div className="flex items-center gap-2 text-white/40 text-sm">
                                                    <Check className="w-4 h-4" />
                                                    <span>{t('appStore.systemApp')}</span>
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
                                                    onClick={() => handleInstall(app.id)}
                                                    size="sm"
                                                    className="flex items-center gap-2 text-white"
                                                    style={{ backgroundColor: accentColor }}
                                                >
                                                    <Download className="w-4 h-4" />
                                                    {t('appStore.install')}
                                                </Button>
                                            )}

                                            {isInstalled && !app.isCore && (
                                                <div className="flex items-center gap-1 text-green-400 text-xs">
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
