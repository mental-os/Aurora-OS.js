import { useState, useRef } from 'react';
import pkg from '../../../package.json';

import { Terminal, Code, Cpu, Activity, PartyPopper, Bell, Volume2, HardDrive, FileJson, RefreshCw, Trash2, Download, Upload, XCircle, ChevronRight, ChevronDown, Copy } from 'lucide-react';
import { AppTemplate } from '@/components/apps/AppTemplate';
import { GlassButton } from '@/components/ui/GlassButton';
import { EmptyState } from '@/components/ui/empty-state';
import { notify } from '@/services/notifications';
import { feedback } from '@/services/soundFeedback';
import { getStorageStats, formatBytes } from '@/utils/memory';
import { useFileSystem } from '@/components/FileSystemContext';
import { useAppContext } from '@/components/AppContext';
import { useI18n } from '@/i18n/index';

export function DevCenter() {
    const { fileSystem, resetFileSystem } = useFileSystem();
    const { activeUser } = useAppContext();
    const [activeTab, setActiveTab] = useState('dashboard');
    const { t } = useI18n();

    const devSidebar = {
        sections: [
            {
                title: t('devCenter.sidebar.generalTitle'),
                items: [
                    { id: 'dashboard', label: t('devCenter.sidebar.dashboard'), icon: Activity },
                ]
            },
            {
                title: t('devCenter.sidebar.interfaceTitle'),
                items: [
                    { id: 'UI', label: t('devCenter.sidebar.uiAndSounds'), icon: PartyPopper },
                ]
            },
            {
                title: t('devCenter.sidebar.systemTitle'),
                items: [
                    { id: 'storage', label: t('devCenter.sidebar.storage'), icon: HardDrive },
                    { id: 'filesystem', label: t('devCenter.sidebar.fileSystem'), icon: FileJson },
                    { id: 'logs', label: t('devCenter.sidebar.systemLogs'), icon: Terminal },
                ]
            },
            {
                title: t('devCenter.sidebar.toolsTitle'),
                items: [
                    { id: 'editor', label: t('devCenter.sidebar.editor'), icon: Code },
                    { id: 'performance', label: t('devCenter.sidebar.performance'), icon: Cpu },
                ]
            }
        ]
    };

    // Storage Tab State
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
    const [, setStorageUpdate] = useState(0); // Trigger re-render for storage
    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshStorage = () => setStorageUpdate(prev => prev + 1);

    const toggleExpandKey = (key: string) => {
        const newSet = new Set(expandedKeys);
        if (newSet.has(key)) newSet.delete(key);
        else newSet.add(key);
        setExpandedKeys(newSet);
    };

    const handleExportStorage = () => {
        try {
            const data = JSON.stringify(localStorage, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `aurora-prefs-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            notify.system('success', t('devCenter.storage.toastTitle'), t('devCenter.storage.exportSuccess'), t('notifications.subtitles.export'));
        } catch {
            notify.system('error', t('devCenter.storage.toastTitle'), t('devCenter.storage.exportFail'));
        }
    };

    const handleImportStorage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                if (typeof json !== 'object' || json === null) throw new Error();

                // Be careful not to wipe specialized internal keys if needed, 
                // but usually full restore implies wiping others or merging. 
                // We'll merge/overwrite here.
                Object.entries(json).forEach(([key, value]) => {
                    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                });
                refreshStorage();
                notify.system('success', t('devCenter.storage.toastTitle'), t('devCenter.storage.importSuccess'), t('notifications.subtitles.import'));
            } catch {
                notify.system('error', t('devCenter.storage.toastTitle'), t('devCenter.storage.importFailed'), t('notifications.subtitles.import'));
            }
        };
        reader.readAsText(file);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleClearStorage = () => {
        if (confirm(t('devCenter.storage.clearConfirm'))) {
            localStorage.clear();
            refreshStorage();
            notify.system('success', t('devCenter.storage.toastTitle'), t('devCenter.storage.clearSuccess'), t('notifications.subtitles.success'));
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        notify.system('success', t('devCenter.clipboard.toastTitle'), t('devCenter.clipboard.copySuccess'));
    };

    const renderContent = ({ width }: { width: number }) => {
        const isNarrow = width < 500;
        const isVeryNarrow = width < 350;

        switch (activeTab) {
            case 'UI':
                return (
                    <div className={`h-full overflow-y-auto ${isNarrow ? 'p-4' : 'p-6'}`}>
                        <div className="max-w-4xl mx-auto space-y-8">
                            {/* System Notifications */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <Bell className="w-5 h-5 text-white" />
                                    <h2 className="text-xl text-white font-medium">{t('devCenter.ui.systemNotifications')}</h2>
                                </div>
                                <div className={`grid gap-4 ${isNarrow ? 'grid-cols-1' : 'grid-cols-3'}`}>
                                    <GlassButton
                                        variant="default"
                                        className="h-auto block p-4 text-left group border-green-500/20 bg-green-500/10 hover:bg-green-500/20"
                                        onClick={() => notify.system('success', t('devCenter.appTitle'), t('devCenter.ui.successMessage'))}
                                    >
                                        <div className="font-medium text-green-400 mb-1 group-hover:text-green-300">{t('devCenter.ui.successToast')}</div>
                                        <div className="text-sm text-white/50 whitespace-normal">{t('devCenter.ui.successDescription')}</div>
                                    </GlassButton>
                                    <GlassButton
                                        variant="default"
                                        className="h-auto block p-4 text-left group border-yellow-500/20 bg-yellow-500/10 hover:bg-yellow-500/20"
                                        onClick={() => notify.system('warning', t('devCenter.appTitle'), t('devCenter.ui.warningMessage'))}
                                    >
                                        <div className="font-medium text-yellow-400 mb-1 group-hover:text-yellow-300">{t('devCenter.ui.warningToast')}</div>
                                        <div className="text-sm text-white/50 whitespace-normal">{t('devCenter.ui.warningDescription')}</div>
                                    </GlassButton>
                                    <GlassButton
                                        variant="default"
                                        className="h-auto block p-4 text-left group border-red-500/20 bg-red-500/10 hover:bg-red-500/20"
                                        onClick={() => notify.system('error', t('devCenter.appTitle'), t('devCenter.ui.errorMessage'))}
                                    >
                                        <div className="font-medium text-red-400 mb-1 group-hover:text-red-300">{t('devCenter.ui.errorToast')}</div>
                                        <div className="text-sm text-white/50 whitespace-normal">{t('devCenter.ui.errorDescription')}</div>
                                    </GlassButton>
                                    
                                    {/* App Notification Test */}
                                    <GlassButton
                                        variant="default"
                                        className="h-auto block p-4 text-left group border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 col-span-full"
                                        onClick={() => notify.app('dev-center', activeUser, 'Dev Center Test', 'This is a persistent app notification test.')}
                                    >
                                        <div className="font-medium text-blue-400 mb-1 group-hover:text-blue-300">{t('devCenter.ui.appNotification')}</div>
                                        <div className="text-sm text-white/50 whitespace-normal">{t('devCenter.ui.appNotificationDesc') || 'Test persistent app notification'}</div>
                                    </GlassButton>
                                </div>
                            </section>

                            {/* Sound Feedback */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <Volume2 className="w-5 h-5 text-white" />
                                    <h2 className="text-xl text-white font-medium">{t('devCenter.ui.soundFeedback')}</h2>
                                </div>
                                <div className={`grid gap-4 ${isNarrow ? 'grid-cols-2' : 'grid-cols-4'}`}>
                                    <GlassButton onClick={() => feedback.click()}>
                                        <span className="text-white/80">{t('devCenter.ui.click')}</span>
                                    </GlassButton>
                                    <GlassButton
                                        onClick={() => feedback.hover()}
                                        onMouseEnter={() => feedback.hover()}
                                    >
                                        <span className="text-white/80">{t('devCenter.ui.hover')}</span>
                                    </GlassButton>
                                    <GlassButton onClick={() => feedback.folder()}>
                                        <span className="text-white/80">{t('devCenter.ui.folderOpen')}</span>
                                    </GlassButton>
                                    <GlassButton onClick={() => feedback.windowOpen()}>
                                        <span className="text-white/80">{t('devCenter.ui.windowOpen')}</span>
                                    </GlassButton>
                                    <GlassButton onClick={() => feedback.windowClose()}>
                                        <span className="text-white/80">{t('devCenter.ui.windowClose')}</span>
                                    </GlassButton>
                                </div>
                            </section>
                        </div>
                    </div>
                );
            case 'storage':
                // eslint-disable-next-line no-case-declarations
                const stats = getStorageStats();
                return (
                    <div className={`h-full overflow-y-auto ${isNarrow ? 'p-4' : 'p-6'}`}>
                        <div className={`flex items-center justify-between mb-6 ${isVeryNarrow ? 'flex-col items-start gap-4' : ''}`}>
                            <h2 className="text-xl text-white">{t('devCenter.storage.title')}</h2>
                            <div className={`flex items-center gap-2 ${isVeryNarrow ? 'w-full flex flex-wrap justify-end' : ''}`}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".json"
                                    onChange={handleImportStorage}
                                />
                                <GlassButton
                                    size="sm"
                                    className="gap-1.5 grow md:grow-0"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    {t('devCenter.storage.import')}
                                </GlassButton>
                                <GlassButton
                                    size="sm"
                                    className="gap-1.5 grow md:grow-0"
                                    onClick={handleExportStorage}
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    {t('devCenter.storage.export')}
                                </GlassButton>
                                <GlassButton
                                    size="sm"
                                    variant="danger"
                                    className="gap-1.5 grow md:grow-0"
                                    onClick={handleClearStorage}
                                >
                                    <XCircle className="w-3.5 h-3.5" />
                                    {t('devCenter.storage.clear')}
                                </GlassButton>
                            </div>
                        </div>

                        <div className={`grid gap-4 mb-8 ${isNarrow ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                                <div className="text-sm text-white/50 mb-1">{t('devCenter.storage.softMemory')}</div>
                                <div className="text-2xl text-white font-mono">{formatBytes(stats.softMemory.bytes)}</div>
                                <div className="text-xs text-white/30">{t('devCenter.storage.keysCount', { count: stats.softMemory.keys })}</div>
                            </div>
                            <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                                <div className="text-sm text-white/50 mb-1">{t('devCenter.storage.hardMemory')}</div>
                                <div className="text-2xl text-white font-mono">{formatBytes(stats.hardMemory.bytes)}</div>
                                <div className="text-xs text-white/30">{t('devCenter.storage.keysCount', { count: stats.hardMemory.keys })}</div>
                            </div>
                        </div>

                        <h3 className="text-lg text-white mb-4">{t('devCenter.storage.localStorageKeys')}</h3>
                        <div className="bg-black/20 rounded-lg border border-white/10 overflow-hidden">
                            {Object.keys(localStorage).length === 0 ? (
                                <div className="p-8 text-center text-white/30 text-sm">{t('devCenter.storage.noKeysFound')}</div>
                            ) : (
                                Object.keys(localStorage).map(key => {
                                    const rawValue = localStorage.getItem(key) || '';
                                    const isExpanded = expandedKeys.has(key);
                                    let formattedValue = rawValue;
                                    try {
                                        const parsed = JSON.parse(rawValue);
                                        formattedValue = JSON.stringify(parsed, null, 2);
                                    } catch {
                                        // keeping rawValue
                                    }

                                    return (
                                        <div key={key} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                            <div
                                                className="flex items-center justify-between p-3 cursor-pointer group"
                                                onClick={() => toggleExpandKey(key)}
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden flex-1">
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-4 h-4 text-white/50 shrink-0" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-white/50 shrink-0" />
                                                    )}
                                                    <div className="font-mono text-xs text-white/70 truncate" title={key}>{key}</div>
                                                </div>
                                                <div className="flex items-center gap-4 shrink-0">
                                                    <div className="text-xs text-white/30 whitespace-nowrap">
                                                        {formatBytes(new Blob([rawValue]).size)}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            localStorage.removeItem(key);
                                                            refreshStorage();
                                                            notify.system('success', t('devCenter.storage.toastTitle'), t('devCenter.storage.deletedKey', { key }));
                                                        }}
                                                        className="text-white/30 hover:text-red-400 transition-colors p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            {isExpanded && (
                                                <div className="bg-black/40 border-t border-white/5 p-3 relative group/code">
                                                    <pre className="font-mono text-[11px] text-blue-300 whitespace-pre-wrap break-all pr-8 max-h-[300px] overflow-y-auto">
                                                        {formattedValue}
                                                    </pre>
                                                    <button
                                                        onClick={() => copyToClipboard(formattedValue)}
                                                        className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all opacity-0 group-hover/code:opacity-100"
                                                        title={t('devCenter.clipboard.copyValue')}
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                );
            case 'filesystem':
                return (
                    <div className={`h-full flex flex-col ${isNarrow ? 'p-4' : 'p-6'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl text-white">{t('devCenter.filesystem.title')}</h2>
                            <GlassButton
                                variant="danger"
                                size="sm"
                                className="gap-2"
                                onClick={() => {
                                    if (confirm(t('devCenter.filesystem.resetConfirm'))) {
                                        resetFileSystem();
                                        notify.system('warning', t('devCenter.filesystem.toastTitle'), t('devCenter.filesystem.resetSuccess'));
                                    }
                                }}
                            >
                                <RefreshCw className="w-4 h-4" />
                                {t('devCenter.filesystem.resetButton')}
                            </GlassButton>
                        </div>
                        <div className="flex-1 bg-black/40 rounded-lg p-4 font-mono text-xs text-blue-300 overflow-y-auto border border-white/10 whitespace-pre">
                            {JSON.stringify(fileSystem, null, 2)}
                        </div>
                    </div>
                );
            case 'logs':
                return (
                    <div className={`h-full flex flex-col ${isNarrow ? 'p-4' : 'p-6'}`}>
                        <h2 className="text-xl text-white mb-4">{t('devCenter.logs.title')}</h2>
                        <div className="flex-1 bg-black/40 rounded-lg p-4 font-mono text-sm text-green-400 overflow-y-auto border border-white/10">
                            <div className="opacity-50">{t('devCenter.logs.kernelInitialized')}</div>
                            <div className="opacity-50">{t('devCenter.logs.loadingDrivers')}</div>
                            <div>{t('devCenter.logs.userLoggedIn', { username: 'drago' })}</div>
                            <div>{t('devCenter.logs.launched')}</div>
                        </div>
                    </div>
                );
            case 'editor':
                return (
                    <EmptyState
                        icon={Code}
                        title={t('devCenter.editor.title')}
                        description={t('devCenter.editor.description')}
                    />
                );
            case 'performance':
                return (
                    <EmptyState
                        icon={Cpu}
                        title={t('devCenter.performance.title')}
                        description={t('devCenter.performance.description')}
                    />
                );
            case 'dashboard':
            default:
                return (
                    <EmptyState
                        icon={Activity}
                        title={t('devCenter.dashboard.title')}
                        description={t('devCenter.dashboard.description', { productName: pkg.build.productName })}
                    />
                );
        }
    };

    return (
        <AppTemplate
            sidebar={devSidebar}
            content={renderContent}
            activeItem={activeTab}
            onItemClick={setActiveTab}
        />
    );
}

import { AppMenuConfig } from '@/types';

export const devCenterMenuConfig: AppMenuConfig = {
    menus: ['File', 'Edit', 'View', 'Tools', 'Window', 'Help'],
    items: {
        'Tools': [
            { labelKey: 'devCenter.menu.resetFilesystem', action: 'reset-fs' },
            { labelKey: 'devCenter.menu.clearLogs', action: 'clear-logs' },
            { type: 'separator' },
            { labelKey: 'devCenter.menu.runDiagnostics', action: 'run-diagnostics' }
        ]
    }
};
