import { useState, useMemo } from 'react';
import { AppTemplate } from './AppTemplate';
import { useFileSystem } from '../FileSystemContext';
import { getAllApps, getAppsByCategory, type AppMetadata } from '../../config/appRegistry';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Download, Trash2, Check } from 'lucide-react';
import { cn } from '../ui/utils';
import { useAppContext } from '../AppContext';

interface AppStoreProps {
    owner?: string;
}

export function AppStore({ owner: _owner }: AppStoreProps) {
    const { installedApps, installApp, uninstallApp } = useFileSystem();
    const { accentColor } = useAppContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | AppMetadata['category']>('all');

    const categories: Array<{ id: 'all' | AppMetadata['category']; label: string }> = [
        { id: 'all', label: 'All' },
        { id: 'productivity', label: 'Productivity' },
        { id: 'media', label: 'Media' },
        { id: 'utilities', label: 'Utilities' },
        { id: 'development', label: 'Development' },
        { id: 'system', label: 'System' },
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
        installApp(appId);
    };

    const handleUninstall = (appId: string) => {
        uninstallApp(appId);
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
                            placeholder="Search apps..."
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
                        <div className="flex flex-col items-center justify-center h-64 text-white/40">
                            <Search className="w-16 h-16 mb-4" />
                            <p className="text-lg">No apps found</p>
                            <p className="text-sm">Try adjusting your search or category filter</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredApps.map((app) => {
                                const isInstalled = installedApps.has(app.id);
                                const IconComponent = app.icon;

                                return (
                                    <div
                                        key={app.id}
                                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                                    >
                                        {/* App Icon & Name */}
                                        <div className="flex items-start gap-4 mb-3">
                                            <div
                                                className={cn(
                                                    "w-16 h-16 rounded-xl flex items-center justify-center text-white shrink-0",
                                                    `bg-gradient-to-br ${app.iconColor}`
                                                )}
                                            >
                                                <IconComponent className="w-8 h-8" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-semibold text-lg mb-1">{app.name}</h3>
                                                <p className="text-white/60 text-xs uppercase tracking-wide">{app.category}</p>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-white/70 text-sm mb-4 line-clamp-2">{app.description}</p>

                                        {/* Install/Uninstall Button */}
                                        <div className="flex items-center gap-2">
                                            {app.isCore ? (
                                                <div className="flex items-center gap-2 text-white/40 text-sm">
                                                    <Check className="w-4 h-4" />
                                                    <span>System App</span>
                                                </div>
                                            ) : isInstalled ? (
                                                <Button
                                                    onClick={() => handleUninstall(app.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex items-center gap-2 border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/40"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Uninstall
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleInstall(app.id)}
                                                    size="sm"
                                                    className="flex items-center gap-2 text-white"
                                                    style={{ backgroundColor: accentColor }}
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Install
                                                </Button>
                                            )}

                                            {isInstalled && !app.isCore && (
                                                <div className="flex items-center gap-1 text-green-400 text-xs">
                                                    <Check className="w-3 h-3" />
                                                    Installed
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            }
        />
    );
}
