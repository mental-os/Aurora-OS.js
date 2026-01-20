import { useState, useRef, useEffect, useMemo } from 'react';
import { 
    Cpu, Activity, PartyPopper, HardDrive, 
    FileJson, Trash2, Download, Upload, XCircle, ChevronRight, 
    ChevronDown, Zap, FolderTree, FileText, Folder, Info,
    MessageSquare, Send
} from 'lucide-react';
import { AppTemplate } from '@/components/apps/AppTemplate';
import { GlassButton } from '@/components/ui/GlassButton';
import { EmptyState } from '@/components/ui/empty-state';
import { notify } from '@/services/notifications';
import { feedback } from '@/services/soundFeedback';
import { MessagesService } from '@/services/MessagesService';
import { getStorageStats, formatBytes, getWindowKey, STORAGE_KEYS } from '@/utils/memory';
import { calculateTotalRamUsage, RamUsageReport } from '@/utils/resourceMonitor';
import { useFileSystem, FileNode } from '@/components/FileSystemContext';
import { useAppContext } from '@/components/AppContext';
import { useI18n } from '@/i18n/index';
import { cn } from '@/components/ui/utils';

// --- Types ---

interface WindowProcess {
    id: string;
    appId: string;
    title: string;
    owner: string;
    zIndex: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
    isMinimized?: boolean;
}

// --- Helper Functions ---

const countNodes = (node: FileNode): { files: number, dirs: number, size: number } => {
    let files = 0;
    let dirs = node.type === 'directory' ? 1 : 0;
    let size = node.content ? new Blob([node.content]).size : 0;

    if (node.type === 'file') files = 1;

    if (node.children) {
        node.children.forEach(child => {
            const stats = countNodes(child);
            files += stats.files;
            dirs += stats.dirs;
            size += stats.size;
        });
    }
    return { files, dirs, size };
};

// --- Helper Components ---

const FileSystemTree = ({ node, depth = 0, onSelectFile, selectedPath }: { node: FileNode; depth?: number; onSelectFile: (node: FileNode) => void; selectedPath?: string; }) => {

    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = node.type === 'directory' && node.children && node.children.length > 0;
    const paddingLeft = depth * 16 + 12;
    const isSelected = selectedPath === node.name;
    const Icon = node.type === 'directory' ? Folder : FileText;
    
    const handleExpandToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasChildren) setIsExpanded(!isExpanded);
    };

    return (
        <div>
            <div 
                className={cn(
                    "flex items-center gap-2 py-1 px-2 hover:bg-white/5 cursor-pointer select-none text-xs font-mono transition-colors border-l-2 border-transparent",
                    "flex items-center gap-2 py-1 px-2 hover:bg-white/5 cursor-pointer select-none text-xs font-mono transition-colors border-l-2 border-transparent",
                    isSelected && "bg-white/10",
                    isExpanded && "bg-white/5"
                )}
                style={{ 
                    paddingLeft,
                    borderColor: isSelected ? 'var(--accent-user)' : 'transparent'
                }}
                onClick={() => onSelectFile(node)}
            >
                <div 
                    className="w-4 h-4 flex items-center justify-center shrink-0 text-white/40 hover:text-white/80 transition-colors"
                    onClick={handleExpandToggle}
                >
                    {node.type === 'directory' && hasChildren && (
                        isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
                    )}
                </div>
                
                <Icon 
                    className={cn("w-3.5 h-3.5", node.type === 'directory' ? "text-(--accent-user)" : "text-white/60")} 
                    style={node.type === 'directory' ? { color: 'var(--accent-user)' } : undefined}
                />
                
                <span className={cn("truncate", node.name.startsWith('.') ? "text-white/40" : "text-white/80")}>
                    {node.name}
                </span>

                {node.type === 'file' && (
                    <span className="ml-auto text-[10px] text-white/20">
                        {node.content ? formatBytes(new Blob([node.content]).size) : '0 B'}
                    </span>
                )}
            </div>
            {isExpanded && node.children && (
                <div>
                    {[...node.children]
                        .sort((a, b) => {
                            if (a.type === b.type) return a.name.localeCompare(b.name);
                            return a.type === 'directory' ? -1 : 1;
                        })
                        .map((child) => (
                            <FileSystemTree 
                                key={child.id} 
                                node={child} 
                                depth={depth + 1} 
                                onSelectFile={onSelectFile}
                                selectedPath={selectedPath}
                            />
                        ))}
                </div>
            )}
        </div>
    );
};

export function DevCenter() {
    const { fileSystem, currentUser } = useFileSystem();
    const { activeUser } = useAppContext();
    const [activeTab, setActiveTab] = useState('dashboard');
    const { t } = useI18n();

    // --- State: Memory ---
    const [ramReport, setRamReport] = useState<RamUsageReport | null>(null);

    // --- State: Processes ---
    const [processList, setProcessList] = useState<WindowProcess[]>([]);

    const [selectedFileNode, setSelectedFileNode] = useState<FileNode | null>(null);

    // --- State: Storage ---
    const [expandedStorageKeys, setExpandedStorageKeys] = useState<Set<string>>(new Set());

    const toggleStorageKey = (key: string) => {
        const next = new Set(expandedStorageKeys);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        setExpandedStorageKeys(next);
    };

    const [, setStorageUpdate] = useState(0); // Trigger re-render
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- State: Messages Debugger ---
    const [messagesDbTrigger, setMessagesDbTrigger] = useState(0);
    const [msgUsername, setMsgUsername] = useState('');
    const [msgPassword, setMsgPassword] = useState('');
    const [msgContent, setMsgContent] = useState('');
    const [msgFrom, setMsgFrom] = useState('');
    const [msgTo, setMsgTo] = useState('');

    const [messagesDB, setMessagesDB] = useState<{ accounts: Record<string, any>, messages: any[] }>({ accounts: {}, messages: [] });

    useEffect(() => {
        const load = () => {
            try {
                const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES_DB);
                if (!raw) setMessagesDB({ accounts: {}, messages: [] });
                else setMessagesDB(JSON.parse(raw));
            } catch {
                setMessagesDB({ accounts: {}, messages: [] });
            }
        };
        load();
    }, [messagesDbTrigger, activeTab]);

    const refreshMessagesDB = () => setMessagesDbTrigger(p => p + 1);

    const handleCreateAccount = (e: React.FormEvent) => {
        e.preventDefault();
        if (!msgUsername || !msgPassword) return;
        const result = MessagesService.createAccount(msgUsername, msgPassword);
        if (result.success) {
            notify.system('success', 'Messages Debugger', t('devCenter.messages.createValues.success', { username: msgUsername }));
            setMsgUsername('');
            setMsgPassword('');
            refreshMessagesDB();
        } else {
            notify.system('error', 'Messages Debugger', result.error || 'Failed');
        }
    };

    const handleDeleteAccount = (username: string) => {
        if (!confirm(t('devCenter.messages.registry.deleteConfirm', { username }))) return;
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES_DB);
            const db = raw ? JSON.parse(raw) : { accounts: {}, messages: [] };
            delete db.accounts[username];
            localStorage.setItem(STORAGE_KEYS.MESSAGES_DB, JSON.stringify(db));
            notify.system('success', 'Messages Debugger', t('devCenter.messages.registry.deleteSuccess', { username }));
            refreshMessagesDB();
        } catch {
            notify.system('error', 'Messages Debugger', 'Failed to delete account');
        }
    };

    const handleDebugSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!msgFrom || !msgTo || !msgContent) return;
        
        const result = MessagesService.sendMessage(msgFrom, msgTo, msgContent);
        if (result.success) {
            notify.system('success', 'Messages Debugger', t('devCenter.messages.sendMessage.success'));
            setMsgContent('');
            refreshMessagesDB();
        } else {
            notify.system('error', 'Messages Debugger', result.error || 'Failed');
        }
    };

    // --- Memoized Stats ---
    // Moved to top level to obey Rules of Hooks
    const fsStats = useMemo(() => countNodes(fileSystem), [fileSystem]);

    // --- Effects ---

    // Poll Memory & Processes
    useEffect(() => {
        if (!currentUser) return;

        const updateStats = () => {
            // Memory
            setRamReport(calculateTotalRamUsage(currentUser));

            // Processes (Windows)
            const winsKey = getWindowKey(currentUser);
            try {
                const wins = JSON.parse(localStorage.getItem(winsKey) || '[]');
                // Add some robustness if structure changes
                const formatted = wins.map((w: any) => ({
                    id: w.id,
                    appId: w.type, // Map 'type' to 'appId'
                    title: w.title || w.type,
                    owner: w.owner || currentUser,
                    zIndex: w.zIndex || 0,
                    position: w.position || { x: 0, y: 0 },
                    size: w.size || { width: 0, height: 0 },
                    isMinimized: w.isMinimized
                }));
                // Sort by Z-Index descending (Topmost first)
                formatted.sort((a: WindowProcess, b: WindowProcess) => b.zIndex - a.zIndex);
                setProcessList(formatted);
            } catch {
                setProcessList([]);
            }
        };

        updateStats();
        const interval = setInterval(updateStats, 2000);
        return () => clearInterval(interval);
    }, [currentUser, activeTab]); 

    // --- Helpers ---

    const refreshStorage = () => setStorageUpdate(prev => prev + 1);

    const handleClearStorage = () => {
        if (confirm(t('devCenter.storage.clearConfirm'))) {
            localStorage.clear();
            refreshStorage();
            notify.system('success', t('devCenter.storage.toastTitle'), t('devCenter.storage.clearSuccess'), t('notifications.subtitles.success'));
        }
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
            notify.system('success', t('devCenter.storage.toastTitle'), t('devCenter.storage.exportSuccess'));
        } catch {
            notify.system('error', t('devCenter.storage.toastTitle'), t('devCenter.storage.exportFail'));
        }
    };

    const handleImportStorage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                localStorage.clear();
                Object.keys(json).forEach(key => {
                    localStorage.setItem(key, json[key]);
                });
                refreshStorage();
                notify.system('success', t('devCenter.storage.toastTitle'), t('devCenter.storage.importSuccess'));
            } catch {
                notify.system('error', t('devCenter.storage.toastTitle'), t('devCenter.storage.importFail'));
            }
        };
        reader.readAsText(file);
    };

    // --- Renderers ---

    const devSidebar = {
        sections: [
            {
                title: t('devCenter.sidebar.generalTitle'),
                items: [
                    { id: 'dashboard', label: t('devCenter.sidebar.dashboard'), icon: Activity },
                ]
            },
            {
                title: t('devCenter.sidebar.systemTitle'),
                items: [
                    { id: 'memory', label: t('memory.title'), icon: Cpu },
                    { id: 'processes', label: t('devCenter.sidebar.performance'), icon: Zap }, // Reusing Performance label for Processes
                    { id: 'storage', label: t('devCenter.sidebar.storage'), icon: HardDrive },
                    { id: 'filesystem', label: t('devCenter.sidebar.fileSystem'), icon: FolderTree },
                ]
            },
            {
                title: t('devCenter.sidebar.interfaceTitle'),
                items: [
                    { id: 'UI', label: t('devCenter.sidebar.uiAndSounds'), icon: PartyPopper },
                ]
            },
            {
                title: t('devCenter.sidebar.appsTitle'), // New "Apps" section
                items: [
                    { id: 'apps-messages', label: t('messages.title'), icon: MessageSquare }, // Using MessageSquare icon
                ]
            }
        ]
    };

    const renderContent = ({ width }: { width: number }) => {
        const isNarrow = width < 600;

        switch (activeTab) {
            case 'dashboard':
                return <EmptyState icon={Activity} title={t('devCenter.dashboard.title')} description={t('devCenter.dashboard.description')} />;


            case 'memory': {
                const totalRam = 2048;
                const usedRam = ramReport?.totalMB || 0;
                const pressure = (usedRam / totalRam) * 100;
                
                return (
                    <div className="h-full flex flex-col p-6">
                         <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl text-white font-medium flex items-center gap-3">
                                <Cpu className="w-6 h-6 text-white/70" />
                                {t('memory.title')}
                            </h2>
                            <span className="text-xs font-mono text-white/50">Total: 2 GB</span>
                        </div>

                        {/* Memory Map */}
                        <div className="mb-8">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-white/70">Memory Pressure</span>
                                <span className={cn("font-medium", pressure > 80 ? 'text-red-400' : 'text-green-400')}>
                                    {pressure.toFixed(1)}%
                                </span>
                            </div>
                            <div className="h-4 bg-white/10 rounded-full overflow-hidden flex">
                                {/* Wired/System */}
                                <div 
                                    className="h-full bg-white/50" 
                                    style={{ width: `${(ramReport?.breakdown.find(b => b.sessionType === 'Active')?.sessionRam || 0) / totalRam * 100}%` }}
                                    title="System Wired"
                                />
                                {/* Apps */}
                                <div 
                                    className="h-full bg-blue-500" 
                                    style={{ width: `${(ramReport?.breakdown.reduce((acc, curr) => acc + curr.appsRam, 0) || 0) / totalRam * 100}%` }}
                                    title="App Memory"
                                />
                            </div>
                            <div className="flex gap-4 mt-2 text-[10px] uppercase text-white/40 font-medium tracking-wider">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white/50" /> Wired</div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> App</div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white/10" /> Free</div>
                            </div>
                        </div>

                        {/* Details Table */}
                        <div className="flex-1 overflow-hidden border border-white/10 rounded-lg bg-black/20 flex flex-col">
                            <div className="grid grid-cols-12 gap-4 p-3 border-b border-white/10 text-xs font-medium text-white/40 uppercase tracking-wider bg-white/5">
                                <div className="col-span-6">Source</div>
                                <div className="col-span-3 text-right">User</div>
                                <div className="col-span-3 text-right">Memory</div>
                            </div>
                            <div className="overflow-y-auto p-0 scroll-smooth">
                                {ramReport?.breakdown.map((session, i) => (
                                    <div key={i} className="contents">
                                        {/* Session Row */}
                                        <div className="grid grid-cols-12 gap-4 px-3 py-2 border-b border-white/5 hover:bg-white/5 text-sm">
                                            <div className="col-span-6 flex items-center gap-2 text-white/80">
                                                <div className={`w-1.5 h-1.5 rounded-full ${session.sessionType === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                Session Base
                                            </div>
                                            <div className="col-span-3 text-right text-white/40">{session.user}</div>
                                            <div className="col-span-3 text-right font-mono text-white/60">{session.sessionRam} MB</div>
                                        </div>
                                        {/* App Details */}
                                        {session.details.map((detail, idx) => {
                                            const match = detail.match(/\[(.*?)\] (.*?): (\d+(\.\d+)?)MB/);
                                            if (!match) return null;
                                            const [, appName, desc, size] = match;
                                            return (
                                                 <div key={`${i}-${idx}`} className="grid grid-cols-12 gap-4 px-3 py-2 border-b border-white/5 hover:bg-white/5 text-sm bg-white/2">
                                                    <div className="col-span-6 pl-6 text-white/70 flex items-center gap-2">
                                                        <span className="text-blue-300">{appName}</span>
                                                        <span className="text-white/30 text-xs">- {desc}</span>
                                                    </div>
                                                    <div className="col-span-3 text-right text-white/30 text-xs">{session.user}</div>
                                                    <div className="col-span-3 text-right font-mono text-white text-xs">{size} MB</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            }

            case 'processes':
                return (
                    <div className="h-full flex flex-col p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl text-white font-medium flex items-center gap-3">
                                <Zap className="w-6 h-6 text-white/70" />
                                {t('devCenter.performance.title')} {/* "Performance" -> Processes */}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 rounded bg-white/10 text-xs text-white/60">
                                    {processList.length} Windows Active
                                </span>
                            </div>
                        </div>

                        {/* Process Table */}
                        <div className="flex-1 overflow-hidden border border-white/10 rounded-lg bg-black/20 flex flex-col">
                             <div className="grid grid-cols-12 gap-2 p-3 border-b border-white/10 text-xs font-medium text-white/40 uppercase tracking-wider bg-white/5">
                                <div className="col-span-1">ID</div>
                                <div className="col-span-4">Window Title</div>
                                <div className="col-span-2">User</div>
                                <div className="col-span-3">Geometry</div>
                                <div className="col-span-2 text-right">Z-Index</div>
                            </div>
                            <div className="overflow-y-auto">
                                {processList.length === 0 ? (
                                    <div className="p-8 text-center text-white/30 text-sm">No active windows found for {activeUser}</div>
                                ) : (
                                    processList.map((proc) => (
                                        <div key={proc.id} className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-white/5 hover:bg-white/5 text-sm group">
                                            <div className="col-span-1 font-mono text-white/30 text-xs truncate" title={proc.id}>
                                                {proc.id.split('-').pop()}
                                            </div>
                                            <div className="col-span-4 text-white/80 flex items-center gap-2 truncate">
                                                {proc.title}
                                                {proc.isMinimized && <span className="text-[10px] bg-white/10 px-1 rounded text-white/40">MIN</span>}
                                            </div>
                                            <div className="col-span-2 text-white/50 text-xs">{proc.owner}</div>
                                            <div className="col-span-3 font-mono text-white/40 text-[10px]">
                                                {Math.round(proc.position.x)},{Math.round(proc.position.y)} • {Math.round(proc.size.width)}x{Math.round(proc.size.height)}
                                            </div>
                                            <div className="col-span-2 text-right font-mono text-blue-300">
                                                {proc.zIndex}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'filesystem':
                return (
                    <div className="h-full flex flex-col p-6">
                         <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl text-white font-medium flex items-center gap-3">
                                <FolderTree className="w-6 h-6 text-white/70" />
                                {t('devCenter.filesystem.title')}
                            </h2>
                            <div className="flex gap-4 text-xs text-white/40 font-mono">
                                <span>{fsStats.dirs} Dirs</span>
                                <span>{fsStats.files} Files</span>
                                <span>{formatBytes(fsStats.size)} used</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden flex gap-4">
                            {/* Tree View */}
                            <div className="flex-1 flex flex-col overflow-hidden border border-white/10 rounded-lg bg-black/20">
                                <div className="p-2 border-b border-white/10 bg-white/5 flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                                    </div>
                                    <span className="text-xs text-white/30 ml-2 font-mono">root@aurora-os:~</span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                                    <FileSystemTree 
                                        node={fileSystem} 
                                        onSelectFile={setSelectedFileNode} 
                                        selectedPath={selectedFileNode?.name} 
                                    />
                                </div>
                            </div>
                            
                            {/* Preview Pane */}
                            <div className="w-1/3 border border-white/10 rounded-lg bg-black/20 overflow-hidden flex flex-col">
                                <div className="p-3 border-b border-white/10 bg-white/5 text-xs font-medium text-white/50 uppercase tracking-wider">
                                    Properties
                                </div>
                                {selectedFileNode ? (
                                    <div className="flex-1 p-4 overflow-y-auto">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 bg-white/5 rounded-xl">
                                                {selectedFileNode.type === 'directory' ? (
                                                     <Folder className="w-8 h-8 text-blue-400" />
                                                ) : (
                                                     <FileText className="w-8 h-8 text-white/60" />
                                                )}
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="text-sm font-medium text-white truncate" title={selectedFileNode.name}>{selectedFileNode.name}</div>
                                                <div className="text-xs text-white/40 font-mono">
                                                    {selectedFileNode.type.toUpperCase()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-1">Details</div>
                                                <div className="bg-white/5 rounded-lg p-3 space-y-2 text-xs font-mono">
                                                     <div className="flex justify-between">
                                                        <span className="text-white/50">Size</span>
                                                        <span className="text-white">{formatBytes(selectedFileNode.content ? new Blob([selectedFileNode.content]).size : 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-white/50">Permissions</span>
                                                        <span className="text-yellow-400">{selectedFileNode.permissions || '-'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-white/50">Owner</span>
                                                        <span className="text-green-400">{selectedFileNode.owner || 'root'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-white/50">Group</span>
                                                        <span className="text-purple-400">{selectedFileNode.group || 'root'}</span>
                                                    </div>
                                                    {selectedFileNode.modified && (
                                                        <div className="flex justify-between">
                                                            <span className="text-white/50">Modified</span>
                                                            <span className="text-white/70">{new Date(selectedFileNode.modified).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                     <div className="flex justify-between pt-2 border-t border-white/5">
                                                        <span className="text-white/50">ID</span>
                                                        <span className="text-white/30 text-[10px]">{selectedFileNode.id.split('-').pop()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {selectedFileNode.type === 'file' && (
                                                <div>
                                                    <div className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-1">Preview</div>
                                                    <div className="text-xs font-mono text-white/70 whitespace-pre-wrap break-all bg-black/30 p-3 rounded border border-white/5 max-h-40 overflow-y-auto">
                                                        {selectedFileNode.content || <span className="text-white/20 italic">Empty file</span>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-white/20">
                                        <Info className="w-12 h-12 mb-2 p-3 bg-white/5 rounded-xl text-white/10" />
                                        <span className="text-xs">Select an item to inspect</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'storage': {

                const stats = getStorageStats();
                return (
                    <div className="h-full flex flex-col p-6">
                         <div className={`flex items-center justify-between mb-6 ${isNarrow ? 'flex-col items-start gap-4' : ''}`}>
                             <h2 className="text-xl text-white font-medium flex items-center gap-3">
                                <HardDrive className="w-6 h-6 text-white/70" />
                                {t('devCenter.storage.title')}
                             </h2>
                            <div className={`flex items-center gap-2 ${isNarrow ? 'w-full flex flex-wrap justify-end' : ''}`}>
                                <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportStorage} /> 
                                <GlassButton size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="w-3.5 h-3.5" />
                                    Import
                                </GlassButton>
                                <GlassButton size="sm" className="gap-1.5" onClick={handleExportStorage}>
                                    <Download className="w-3.5 h-3.5" />
                                    {t('devCenter.storage.export')}
                                </GlassButton>
                                <GlassButton size="sm" variant="danger" className="gap-1.5" onClick={handleClearStorage}>
                                    <XCircle className="w-3.5 h-3.5" />
                                    {t('devCenter.storage.clear')}
                                </GlassButton>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
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
                         <div className="flex-1 overflow-hidden bg-black/20 rounded-lg border border-white/10 flex flex-col">
                             <div className="flex-1 overflow-y-auto custom-scrollbar">
                                 {Object.keys(localStorage).sort().map(key => {
                                     const val = localStorage.getItem(key) || '';
                                     const size = new Blob([val]).size;
                                     const isExpanded = expandedStorageKeys.has(key);
                                     
                                     return (
                                         <div key={key} className="border-b border-white/5 last:border-0">
                                             <div 
                                                className={cn(
                                                    "flex items-center justify-between p-3 hover:bg-white/5 group cursor-pointer transition-colors",
                                                    isExpanded && "bg-white/5"
                                                )}
                                                onClick={() => toggleStorageKey(key)}
                                             >
                                                 <div className="flex items-center gap-3 overflow-hidden">
                                                     <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                                        {isExpanded ? <ChevronDown className="w-3 h-3 text-white/40" /> : <ChevronRight className="w-3 h-3 text-white/40" />}
                                                     </div>
                                                     <FileJson className="w-4 h-4 text-white/30" />
                                                     <div className="font-mono text-xs text-white/70 truncate" title={key}>{key}</div>
                                                 </div>
                                                 <span className="text-xs text-white/30 font-mono">{formatBytes(size)}</span>
                                             </div>
                                             {isExpanded && (
                                                 <div className="p-3 bg-black/40 border-t border-white/5 font-mono text-[10px] text-green-400 overflow-x-auto whitespace-pre-wrap break-all shadow-inner">
                                                     {val}
                                                 </div>
                                             )}
                                         </div>
                                     );
                                 })}
                             </div>
                         </div>
                    </div>
                );
            }

            case 'apps-messages':
                return (
                    <div className="h-full flex flex-col p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl text-white font-medium flex items-center gap-3">
                                <MessageSquare className="w-6 h-6 text-white/70" />
                                {t('messages.title')} Debugger
                            </h2>
                            <span className="text-xs font-mono text-white/40">
                                {Object.keys(messagesDB.accounts).length} Accounts • {messagesDB.messages.length} Messages
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
                            {/* Left Col: Account Management */}
                            <div className="flex flex-col gap-6 overflow-hidden">
                                {/* Create Account */}
                                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                    <h3 className="text-sm font-medium text-white mb-3">{t('devCenter.messages.createValues.title')}</h3>
                                    <form onSubmit={handleCreateAccount} className="flex flex-col gap-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <input 
                                                type="text" 
                                                placeholder={t('devCenter.messages.createValues.username')} 
                                                value={msgUsername}
                                                onChange={e => setMsgUsername(e.target.value)}
                                                className="bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                                            />
                                            <input 
                                                type="password" 
                                                placeholder={t('devCenter.messages.createValues.password')} 
                                                value={msgPassword}
                                                onChange={e => setMsgPassword(e.target.value)}
                                                className="bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                                            />
                                        </div>
                                        <GlassButton size="sm" type="submit" disabled={!msgUsername || !msgPassword}>{t('devCenter.messages.createValues.button')}</GlassButton>
                                    </form>
                                </div>

                                {/* Account List */}
                                <div className="flex-1 flex flex-col min-h-0 bg-black/20 border border-white/10 rounded-xl overflow-hidden">
                                    <div className="p-3 bg-white/5 border-b border-white/10 text-xs font-medium text-white/50 uppercase tracking-wider">
                                        {t('devCenter.messages.registry.title')}
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2">
                                        {Object.values(messagesDB.accounts).length === 0 ? (
                                             <div className="text-center text-white/20 text-xs py-4">{t('devCenter.messages.registry.empty')}</div>
                                        ) : (
                                            (Object.values(messagesDB.accounts) as any[]).map(acc => (
                                                <div key={acc.username} className="flex items-center justify-between p-2 hover:bg-white/5 rounded group">
                                                    <div className="flex flex-col">
                                                        <span className="text-white text-sm font-medium">{acc.username}</span>
                                                        <span className="text-[10px] text-white/40 font-mono">{acc.createdAt?.split('T')[0] || 'Unknown'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => { setMsgFrom(acc.username); setMsgTo(acc.username === 'guest' ? 'root' : 'guest'); }}
                                                            className="p-1.5 hover:bg-white/10 rounded text-blue-300 transform hover:scale-105 transition-transform"
                                                            title={t('devCenter.messages.registry.useInSender')}
                                                        >
                                                            <Upload className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteAccount(acc.username)}
                                                            className="p-1.5 hover:bg-red-500/20 rounded text-red-400 transform hover:scale-105 transition-transform"
                                                            title={t('devCenter.messages.registry.delete')}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Messaging Tool */}
                            <div className="flex flex-col gap-6 h-full overflow-hidden">
                                <div className="p-5 bg-white/5 border border-white/10 rounded-xl flex-1 flex flex-col">
                                     <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                                        <Send className="w-4 h-4 text-green-400" />
                                        {t('devCenter.messages.sendMessage.title')}
                                     </h3>
                                     
                                     <form onSubmit={handleDebugSendMessage} className="flex flex-col gap-4 flex-1">
                                         <div className="space-y-1">
                                             <label className="text-xs text-white/50">{t('devCenter.messages.sendMessage.from')}</label>
                                             <div className="relative">
                                                 <select 
                                                    value={msgFrom}
                                                    onChange={e => setMsgFrom(e.target.value)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:border-white/30"
                                                 >
                                                     <option value="">{t('devCenter.messages.sendMessage.selectAccount')}</option>
                                                     {Object.keys(messagesDB.accounts).map(u => (
                                                         <option key={u} value={u}>{u}</option>
                                                     ))}
                                                 </select>
                                                 <ChevronDown className="w-4 h-4 text-white/30 absolute right-3 top-2.5 pointer-events-none" />
                                             </div>
                                         </div>

                                         <div className="space-y-1">
                                             <label className="text-xs text-white/50">{t('devCenter.messages.sendMessage.to')}</label>
                                             <div className="relative">
                                                  {/* We might want a select here too but text is more flexible for testing non-existent users */}
                                                 <select 
                                                    value={msgTo} 
                                                    onChange={e => setMsgTo(e.target.value)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:border-white/30"
                                                 >
                                                    <option value="">{t('devCenter.messages.sendMessage.selectAccount')}</option>
                                                    {Object.keys(messagesDB.accounts).map(u => (
                                                        <option key={u} value={u}>{u}</option>
                                                    ))}
                                                 </select>
                                                  <ChevronDown className="w-4 h-4 text-white/30 absolute right-3 top-2.5 pointer-events-none" />
                                             </div>
                                         </div>

                                         <div className="space-y-1 flex-1 flex flex-col">
                                             <label className="text-xs text-white/50">{t('devCenter.messages.sendMessage.content')}</label>
                                             <textarea 
                                                value={msgContent}
                                                onChange={e => setMsgContent(e.target.value)}
                                                className="w-full flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-white/30 resize-none"
                                                placeholder={t('devCenter.messages.sendMessage.placeholder')}
                                             />
                                         </div>

                                         <GlassButton type="submit" disabled={!msgFrom || !msgTo || !msgContent} className="w-full justify-center">
                                             {t('devCenter.messages.sendMessage.button')}
                                         </GlassButton>
                                     </form>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'UI':
                 // Preserved logic from original, wrapped in new container
                 return (
                    <div className="h-full overflow-y-auto p-6">
                        <h2 className="text-xl text-white mb-6">{t('devCenter.ui.title')}</h2>
                        <section className="mb-8">
                            <h3 className="text-sm uppercase tracking-wider text-white/40 font-semibold mb-4">{t('devCenter.ui.notificationsTitle')}</h3>
                            <div className="flex gap-4 flex-wrap">
                                <GlassButton onClick={() => notify.system('success', 'Test', t('devCenter.ui.successToast'))}>{t('devCenter.ui.buttons.success')}</GlassButton>
                                <GlassButton onClick={() => notify.system('warning', 'Test', t('devCenter.ui.warningToast'))}>{t('devCenter.ui.buttons.warning')}</GlassButton>
                                <GlassButton onClick={() => notify.system('error', 'Test', t('devCenter.ui.errorToast'))}>{t('devCenter.ui.buttons.error')}</GlassButton>
                                <div className="w-px h-8 bg-white/10 mx-2" />
                                <GlassButton onClick={() => notify.app('com.aurora.devcenter', activeUser, 'App Notification', 'This is a test notification from DevCenter.')}>{t('devCenter.ui.buttons.app')}</GlassButton>
                            </div>
                        </section>
                        <section>
                            <h3 className="text-sm uppercase tracking-wider text-white/40 font-semibold mb-4">{t('devCenter.ui.soundFeedback')}</h3>
                             <div className="grid grid-cols-4 gap-4">
                                <GlassButton onClick={() => feedback.click()}>{t('devCenter.ui.buttons.click')}</GlassButton>
                                <GlassButton onClick={() => feedback.hover()}>{t('devCenter.ui.buttons.hover')}</GlassButton>
                                <GlassButton onClick={() => feedback.windowOpen()}>{t('devCenter.ui.buttons.open')}</GlassButton>
                                <GlassButton onClick={() => feedback.windowClose()}>{t('devCenter.ui.buttons.close')}</GlassButton>
                            </div>
                        </section>
                    </div>
                 );
            

            default:
                return <EmptyState icon={Activity} title="Coming Soon" description="This module is under construction." />;
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
            { type: 'separator' },
            { labelKey: 'devCenter.menu.runDiagnostics', action: 'run-diagnostics' }
        ]
    }
};
