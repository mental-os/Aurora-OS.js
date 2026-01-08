
import { useState, useCallback, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup'; // HTML
import 'prismjs/components/prism-bash'; // Bash/Shell
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme

import {
    FileText,
    Save,
    FolderOpen,
    Plus,
    X,
    Eye,
    EyeOff,
    Bold,
    Italic,
    List,
    Type,
    Check,
    ChevronsUpDown
} from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '../ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../ui/popover';
import { cn } from '../ui/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';
import { AppTemplate } from './AppTemplate';
import { useFileSystem } from '../FileSystemContext';
import { FilePicker } from '../ui/FilePicker';
import { toast } from 'sonner';

interface Tab {
    id: string;
    name: string;
    path?: string;
    content: string;
    isModified: boolean;
    context: string; // Dynamic language/context
}

// ... imports
import { useAppContext } from '../AppContext';
import { useWindow } from '../WindowContext';
import { getAppStateKey } from '../../utils/memory';
import { useI18n } from '../../i18n/index';

// ... interface

interface NotepadProps {
    owner?: string;
    initialPath?: string;
}

const extensionToLanguage = (ext: string): string => {
    switch (ext) {
        case 'md': return 'markdown';
        case 'json': return 'json';
        case 'js': case 'jsx': return 'javascript';
        case 'ts': return 'typescript';
        case 'tsx': return 'tsx';
        case 'css': return 'css';
        case 'html': case 'htm': return 'markup';
        case 'sh': return 'bash';
        default: return 'txt';
    }
};

const SUPPORTED_LANGUAGES = [
    { value: 'markdown', labelKey: 'notepad.languages.markdown' },
    { value: 'javascript', labelKey: 'notepad.languages.javascript' },
    { value: 'typescript', labelKey: 'notepad.languages.typescript' },
    { value: 'tsx', labelKey: 'notepad.languages.tsx' },
    { value: 'json', labelKey: 'notepad.languages.json' },
    { value: 'css', labelKey: 'notepad.languages.css' },
    { value: 'markup', labelKey: 'notepad.languages.markup' },
    { value: 'bash', labelKey: 'notepad.languages.bash' },
    { value: 'txt', labelKey: 'notepad.languages.txt' },
];

export function Notepad({ owner, initialPath }: NotepadProps) {
    const { t } = useI18n();
    const { readFile, createFile, writeFile, getNodeAtPath } = useFileSystem();
    const { accentColor, activeUser: desktopUser } = useAppContext();
    const activeUser = owner || desktopUser;
    const windowContext = useWindow();

    const supportedLanguages = SUPPORTED_LANGUAGES.map((lang) => ({
        ...lang,
        label: t(lang.labelKey),
    }));

    const getLanguageDisplayName = (context: string) => {
        const language = supportedLanguages.find((l) => l.value === context);
        if (language) return language.label;

        const unknown = context.charAt(0).toUpperCase() + context.slice(1);
        const key = `notepad.languages.${context}`;
        const translated = t(key);
        return translated === key ? unknown : translated;
    };

    const getUntitledTabName = (index: number) => t('notepad.untitledTab', { index });
    const createDefaultTab = (index: number): Tab => ({
        id: crypto.randomUUID(),
        name: getUntitledTabName(index),
        content: '',
        isModified: false,
        context: 'markdown'
    });

    // State
    const [tabs, setTabs] = useState<Tab[]>(() => {
        // Initializer for lazy state loading
        try {
            if (!activeUser) return [{ id: '1', name: getUntitledTabName(1), content: '', isModified: false, context: 'markdown' }];
            const key = getAppStateKey('notepad', activeUser);
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Validate parsed data structure significantly? 
                // For now, assume it's correct if it exists.
                if (Array.isArray(parsed.tabs) && parsed.tabs.length > 0) {
                    return parsed.tabs;
                }
            }
        } catch (e) {
            console.warn(e);
        }
        return [{ id: '1', name: getUntitledTabName(1), content: '', isModified: false, context: 'markdown' }];
    });

    // We also need to restore activeTabId
    const [activeTabId, setActiveTabId] = useState(() => {
        try {
            if (!activeUser) return '1';
            const key = getAppStateKey('notepad', activeUser);
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.activeTabId || '1';
            }
        } catch {
            return '1';
        }
        return '1';
    });

    // Persist State Effect
    useEffect(() => {
        if (!activeUser) return;
        const key = getAppStateKey('notepad', activeUser);

        const saveState = setTimeout(() => {
            const state = {
                tabs,
                activeTabId
            };
            localStorage.setItem(key, JSON.stringify(state));
        }, 500); // 500ms debounce

        return () => clearTimeout(saveState);
    }, [tabs, activeTabId, activeUser]);

    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [filePickerMode, setFilePickerMode] = useState<'open' | 'save' | null>(null);

    // State for Unsaved Changes Dialog
    const [pendingCloseTabId, setPendingCloseTabId] = useState<string | null>(null);

    const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

    // -- Window Close Interception --
    // Using Ref for tabs to avoid effect re-running on every keystroke
    const tabsRef = useRef(tabs);
    useEffect(() => { tabsRef.current = tabs; }, [tabs]);

    useEffect(() => {
        if (!windowContext) return;

        const checkUnsaved = async (): Promise<boolean> => {
            const currentTabs = tabsRef.current;
            const modifiedTab = currentTabs.find(t => t.isModified);
            if (modifiedTab) {
                setActiveTabId(modifiedTab.id);
                setPendingCloseTabId(modifiedTab.id);
                return false;
            }
            return true;
        };

        windowContext.setBeforeClose(() => checkUnsaved);
        return () => windowContext.setBeforeClose(null);
    }, [windowContext]); // checkUnsaved is stable, tabsRef is stable.

    // -- Window Data / Initial Path Interception (File Opening) --
    const tabsRefForOpening = useRef(tabs);
    useEffect(() => { tabsRefForOpening.current = tabs; }, [tabs]);

    useEffect(() => {
        const path = initialPath || windowContext?.data?.path;
        if (path) {
            // Use ref to avoid closure staleness and dependency on tabs
            const currentTabs = tabsRefForOpening.current;
            const existingTab = currentTabs.find(t => t.path === path);

            if (existingTab) {
                // Use setTimeout to avoid synchronous setState during effect execution (cascading render)
                const tid = existingTab.id;
                setTimeout(() => setActiveTabId(tid), 0);
            } else {
                // Open new tab
                const node = getNodeAtPath(path, activeUser);
                if (node && node.type === 'file') {
                    const name = node.name;
                    const newId = node.id;

                    // Read content with user context
                    const content = readFile(path, activeUser) || '';
                    const extension = name.split('.').pop()?.toLowerCase() || '';
                    const context = extensionToLanguage(extension);

                    const newTab: Tab = {
                        id: newId,
                        name,
                        path,
                        content,
                        isModified: false,
                        context
                    };

                    // If the only tab was the initial blank "Untitled 1" and it was empty/unmodified, replace it.
                    setTimeout(() => {
                        setTabs(prev => {
                            if (prev.length === 1 && !prev[0].path && !prev[0].isModified && prev[0].content === '') {
                                return [newTab];
                            }
                            if (prev.find(t => t.id === newId)) return prev;
                            return [...prev, newTab];
                        });
                        setActiveTabId(newId);
                    }, 0);
                }
            }
        }
    }, [windowContext?.data, initialPath, activeUser, readFile, getNodeAtPath]);

    // -- Tab Management --
    const handleNewTab = () => {
        const newId = crypto.randomUUID();
        const newName = getUntitledTabName(tabs.length + 1);
        setTabs([...tabs, { id: newId, name: newName, content: '', isModified: false, context: 'markdown' }]);
        setActiveTabId(newId);
    };

    const forceCloseTab = (id: string) => {
        if (tabs.length === 1) {
            setTabs([createDefaultTab(1)]);
            setActiveTabId(tabs[0].id); // This will update in next render actually, but logic holds
        } else {
            const newTabs = tabs.filter(t => t.id !== id);
            setTabs(newTabs);
            if (activeTabId === id) {
                setActiveTabId(newTabs[newTabs.length - 1].id);
            }
        }
        setPendingCloseTabId(null);
    };

    const handleCloseTab = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const tabToClose = tabs.find(t => t.id === id);
        if (!tabToClose) return;

        if (tabToClose.isModified) {
            setActiveTabId(id); // Switch to it so context is right
            setPendingCloseTabId(id);
        } else {
            forceCloseTab(id);
        }
    };

    const handleContentChange = (newContent: string) => {
        setTabs(tabs.map(t =>
            t.id === activeTabId
                ? { ...t, content: newContent, isModified: true }
                : t
        ));
    };

    // -- File I/O --
    const handleFileSelect = (path: string) => {
        if (filePickerMode === 'open') {
            const node = getNodeAtPath(path, activeUser);
            if (!node || node.type !== 'file') return;

            const content = readFile(path, activeUser);
            if (content !== null) {
                const name = path.split('/').pop() || t('notepad.untitled');
                const extension = name.split('.').pop()?.toLowerCase() || '';
                const context = extensionToLanguage(extension);

                // Check if we should replace current empty tab or open new
                if (activeTab.content === '' && !activeTab.path && !activeTab.isModified) {
                    setTabs(tabs.map(t =>
                        t.id === activeTabId
                            ? { ...t, name, path, content, isModified: false, context }
                            : t
                    ));
                } else {
                    const newId = crypto.randomUUID();
                    setTabs([...tabs, { id: newId, name, path, content, isModified: false, context }]);
                    setActiveTabId(newId);
                }
            } else {
                toast.error(t('notepad.toasts.failedToReadFile'));
            }
        } else if (filePickerMode === 'save') {
            // Save logic
            // Try updating first (overwrite), then create if distinct
            let success = writeFile(path, activeTab.content, activeUser);

            if (!success) {
                // If writeFile failed, maybe it doesn't exist, try create
                const name = path.split('/').pop() || t('notepad.untitled');
                const dir = path.substring(0, path.lastIndexOf('/')) || '/';
                success = createFile(dir, name, activeTab.content, activeUser);
            }

            if (success) {
                const name = path.split('/').pop() || t('notepad.untitled');
                // Update context based on saved extension
                const extension = name.split('.').pop()?.toLowerCase() || '';
                const context = extensionToLanguage(extension);

                setTabs(tabs.map(t =>
                    t.id === activeTabId
                        ? { ...t, name, path, isModified: false, context }
                        : t
                ));
                toast.success(t('notepad.toasts.fileSaved'));
            } else {
                toast.error(t('notepad.toasts.failedToSaveFilePermissions'));
            }
        }
        setFilePickerMode(null);
    };

    const handleSave = () => {
        if (activeTab.path) {
            // Quick Save using writeFile (updates existing)
            const success = writeFile(activeTab.path, activeTab.content, activeUser);
            if (success) {
                setTabs(tabs.map(t =>
                    t.id === activeTabId
                        ? { ...t, isModified: false }
                        : t
                ));
                toast.success(t('notepad.toasts.saved'));
                return true; // Indicate success for quick save
            } else {
                toast.error(t('notepad.toasts.failedToSave'));
                return false;
            }
        } else {
            setFilePickerMode('save');
            return false; // FilePicker will handle the actual save
        }
    };

    const handleDiscardChanges = () => {
        if (pendingCloseTabId) {
            forceCloseTab(pendingCloseTabId);
        }
    };

    const handleSaveChanges = () => {
        // Trigger save logic
        const saved = handleSave();
        // We can't immediately close because save might be async (FilePicker)
        // Ideally we wait, but for now let's just trigger save.
        // If it's a Quick Save (existing path), it happens instantly.
        // If it needs FilePicker, the user is now in "Save Mode".
        // We should clear the pending close? Or wait?
        // Standard OS behavior: If Save As dialog opens, the "Close" action is paused/cancelled until save is done.
        // So we just close the dialog. If they complete save, they can close manually?
        // Better: We try to save. If `activeTab.path` exists, we confirm save and THEN close.

        if (activeTab.path) {
            // It will save synchronously in handleSave
            // We can force close after?
            // Actually handleSave updates state. 
            // We'll trust the user to close after saving, or we can try to chain it.
            // Let's just dismiss dialog and save.
            setPendingCloseTabId(null);
            if (saved) { // If it was a quick save and successful, then close the tab
                forceCloseTab(activeTabId);
            }
        } else {
            // Needs FilePicker.
            // The user will interact with the FilePicker.
            // We should probably just close the dialog and let the user save via FilePicker.
            // The tab will remain open until they manually close it after saving.
            setPendingCloseTabId(null);
        }
        // Actually, let's keep it simple: "Save" just triggers save. Dialog closes. Tab stays open (unless we implement sophisticated callback).
        // But user wants to close.
        // If I click Save, I expect it to save AND close.
        // Since I can't easy refactor handleSave to return promise/callback right now,
        // calling handleSave() is the best "attempt".
    };

    // -- Editor Helpers --
    const insertMarkdown = (syntax: string) => {
        const textarea = document.querySelector('.prism-editor textarea') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = activeTab.content;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        let newContent = '';

        switch (syntax) {
            case 'bold': newContent = `${before}** ${selection || 'text'}** ${after} `; break;
            case 'italic': newContent = `${before}_${selection || 'text'}_${after} `; break;
            case 'list': newContent = `${before} \n - ${selection}${after} `; break;
            case 'h1': newContent = `${before} \n# ${selection}${after} `; break;
            default: return;
        }

        handleContentChange(newContent);
        setTimeout(() => {
            textarea.focus();
        }, 0);
    };

    // Highlight function for Prism
    const highlight = useCallback((code: string) => {
        const lang = activeTab.context;
        if (lang === 'txt' || !Prism.languages[lang]) {
            return code;
        }
        return Prism.highlight(code, Prism.languages[lang], lang);
    }, [activeTab.context]);

    return (
        <div className="relative h-full w-full">
            <AppTemplate
                hasSidebar={false}
                content={
                    <div className="h-full flex flex-col relative">
                        {/* Custom Toolbar */}
                        <div className="flex flex-col w-full border-b border-white/10 backdrop-blur-md">
                            {/* Tab Bar */}
                            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2 px-2">
                                {tabs.map(tab => (
                                    <div
                                        key={tab.id}
                                        onClick={() => setActiveTabId(tab.id)}
                                        style={{
                                            borderColor: activeTabId === tab.id ? accentColor : 'transparent',
                                            background: activeTabId === tab.id
                                                ? `linear-gradient(to top, ${accentColor}15, transparent)`
                                                : 'transparent',
                                        }}
                                        className={`
                                            group flex items-center gap-2 px-4 py-2 text-xs font-medium cursor-pointer transition-all min-w-[140px] max-w-[220px] border-b-2
                                            ${activeTabId === tab.id
                                                ? 'text-white'
                                                : 'text-white/40 hover:text-white/80 hover:bg-white/5'}
                                        `}
                                    >
                                        <FileText className={`w-3.5 h-3.5 shrink-0 ${activeTabId === tab.id ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'}`} />
                                        <span className={`truncate flex-1 ${tab.isModified ? 'italic' : ''}`}>
                                            {tab.name}{tab.isModified ? '*' : ''}
                                        </span>
                                        <button
                                            onClick={(e) => handleCloseTab(tab.id, e)}
                                            className={`opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-full p-0.5 transition-all ${tabs.length === 1 && !tab.isModified ? 'hidden' : ''}`}
                                        >
                                            <X className="w-3 h-3 text-white/70 hover:text-white" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleNewTab}
                                    className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Action Bar */}
                            <div className="flex items-center justify-between p-2 border-t border-white/5 bg-white/5">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setFilePickerMode('open')}
                                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors flex items-center gap-2"
                                        title={t('notepad.actions.openFile')}
                                    >
                                        <FolderOpen className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        style={{ color: activeTab.isModified ? accentColor : undefined }}
                                        className={`p-1.5 hover:bg-white/10 rounded-md transition-colors flex items-center gap-2 ${activeTab.isModified ? '' : 'text-white/70 hover:text-white'}`}
                                        title={t('notepad.actions.saveFile')}
                                    >
                                        <Save className="w-4 h-4" />
                                    </button>
                                    <div className="w-px h-4 bg-white/10 mx-2" />

                                    {!isPreviewMode && activeTab.context === 'markdown' && (
                                        <>
                                            <button onClick={() => insertMarkdown('bold')} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md" title={t('notepad.actions.bold')}>
                                                <Bold className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => insertMarkdown('italic')} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md" title={t('notepad.actions.italic')}>
                                                <Italic className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => insertMarkdown('list')} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md" title={t('notepad.actions.list')}>
                                                <List className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => insertMarkdown('h1')} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md" title={t('notepad.actions.heading')}>
                                                <Type className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {(activeTab.context === 'markdown' || activeTab.context === 'markup') && (
                                    <button
                                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                                        style={{ backgroundColor: isPreviewMode ? accentColor : undefined }}
                                        className={`
                                        flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                                        ${isPreviewMode
                                                ? 'text-white'
                                                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}
                                    `}
                                    >
                                        {isPreviewMode ? (
                                            <>
                                                <EyeOff className="w-3 h-3" />
                                                {t('notepad.preview.edit')}
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="w-3 h-3" />
                                                {t('notepad.preview.preview')}
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Editor / Preview Area */}
                        {isPreviewMode ? (
                            activeTab.context === 'markdown' ? (
                                <div className="flex-1 overflow-y-auto p-8 text-white">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            h1: ({ node: _node, ...props }) => <h1 className="text-3xl font-bold mb-4 border-b border-white/20 pb-2" style={{ color: accentColor }} {...props} />,
                                            h2: ({ node: _node, ...props }) => <h2 className="text-2xl font-bold mb-3 border-b border-white/10 pb-1" style={{ color: accentColor }} {...props} />,
                                            h3: ({ node: _node, ...props }) => <h3 className="text-xl font-bold mb-2" style={{ color: accentColor }} {...props} />,
                                            p: ({ node: _node, ...props }) => <p className="mb-4 text-white/90 leading-relaxed" {...props} />,
                                            ul: ({ node: _node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                                            ol: ({ node: _node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                                            li: ({ node: _node, ...props }) => <li className="text-white/90" {...props} />,
                                            blockquote: ({ node: _node, ...props }) => <blockquote className="border-l-4 pl-4 italic my-4 text-white/70" style={{ borderColor: accentColor }} {...props} />,
                                            code: ({ node: _node, className, children, ...props }) => {
                                                const match = /language-(\w+)/.exec(className || '')
                                                return match ? (
                                                    <div className="rounded-md overflow-hidden my-4 border border-white/10 bg-black/30">
                                                        <div className="px-3 py-1 bg-white/5 border-b border-white/5 text-xs text-white/50">{match[1]}</div>
                                                        <pre className="p-3 overflow-x-auto text-sm font-mono text-white/90 m-0">
                                                            <code className={className} {...props}>{children}</code>
                                                        </pre>
                                                    </div>
                                                ) : (
                                                    <code
                                                        className="rounded px-1.5 py-0.5 text-sm font-mono font-medium"
                                                        style={{
                                                            backgroundColor: `${accentColor}20`,
                                                            color: accentColor
                                                        }}
                                                        {...props}
                                                    >
                                                        {children}
                                                    </code>
                                                )
                                            },
                                            a: ({ node: _node, ...props }) => <a className="text-blue-400 hover:underline" style={{ color: accentColor }} {...props} />,
                                        }}
                                    >
                                        {activeTab.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-hidden">
                                    <iframe
                                        srcDoc={activeTab.content}
                                        title={t('notepad.preview.htmlPreviewTitle')}
                                        sandbox="allow-scripts"
                                        className="w-full h-full border-none bg-white"
                                    />
                                </div>
                            )
                        ) : (
                            <div className="flex-1 overflow-y-auto relative font-mono text-sm prism-editor cursor-text text-white caret-white" onClick={() => {
                                // Focus helper
                                const textarea = document.querySelector('.prism-editor textarea') as HTMLElement;
                                textarea?.focus();
                            }}>
                                <Editor
                                    value={activeTab.content}
                                    onValueChange={handleContentChange}
                                    highlight={highlight}
                                    padding={24}
                                    className="min-h-full font-mono text-[14px]"
                                    textareaClassName="focus:outline-none text-white"
                                    style={{
                                        fontFamily: '"Fira Code", "Fira Mono", monospace',
                                        fontSize: 14,
                                        backgroundColor: 'transparent',
                                        minHeight: '100%',
                                        color: '#f8f8f2', // Ensure text is light
                                        lineHeight: '1.5',
                                    }}
                                />
                            </div>
                        )}

                        {/* Status Bar */}
                        <div className="h-6 border-t border-white/5 flex items-center justify-between px-3 text-[10px] text-white/30 select-none bg-white/5">
                            <div className="flex gap-4">
                                <span>{t('notepad.status.chars', { count: activeTab.content.length })}</span>
                                <span>{t('notepad.status.lines', { count: activeTab.content.split('\n').length })}</span>
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <div
                                        className="font-mono hover:text-white cursor-pointer transition-colors select-none flex items-center gap-1"
                                        style={{
                                            color: 'rgba(255, 255, 255, 0.5)'
                                        }}
                                        title={t('notepad.contextSwitcher.title')}
                                    >
                                        {getLanguageDisplayName(activeTab.context)}
                                        <ChevronsUpDown className="size-3 opacity-50" />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-[200px] p-0 z-10001"
                                    align="end"
                                    style={{
                                        background: 'rgba(28, 28, 30, 0.95)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                                    }}
                                >
                                    <Command className="bg-transparent text-white">
                                        <CommandInput
                                            placeholder={t('notepad.contextSwitcher.searchPlaceholder')}
                                            className="h-8 text-[11px] border-b border-white/10"
                                            style={{
                                                color: 'white',
                                                caretColor: accentColor
                                            }}
                                        />
                                        <CommandList className="max-h-[200px]">
                                            <CommandEmpty className="text-[11px] py-2 text-white/40">{t('notepad.contextSwitcher.noLanguageFound')}</CommandEmpty>
                                            <CommandGroup>
                                                {supportedLanguages.map((lang) => (
                                                    <CommandItem
                                                        key={lang.value}
                                                        value={lang.value}
                                                        onSelect={(currentValue) => {
                                                            setTabs(tabs.map(t =>
                                                                t.id === activeTabId
                                                                    ? { ...t, context: currentValue }
                                                                    : t
                                                            ));
                                                            toast.info(t('notepad.toasts.switchedTo', { language: lang.label }));
                                                        }}
                                                        className="text-[11px] cursor-pointer transition-all duration-150"
                                                        style={{
                                                            color: activeTab.context === lang.value ? accentColor : 'rgba(255, 255, 255, 0.7)',
                                                            backgroundColor: activeTab.context === lang.value ? `${accentColor}15` : 'transparent'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (activeTab.context !== lang.value) {
                                                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                                                e.currentTarget.style.color = 'white';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (activeTab.context !== lang.value) {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                                            }
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-3 w-3 transition-opacity",
                                                                activeTab.context === lang.value ? "opacity-100" : "opacity-0"
                                                            )}
                                                            style={{
                                                                color: accentColor
                                                            }}
                                                        />
                                                        {lang.label}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                }
            />
            {filePickerMode && (
                <FilePicker
                    isOpen={true}
                    mode={filePickerMode}
                    onClose={() => setFilePickerMode(null)}
                    onSelect={handleFileSelect}
                    defaultPath={activeTab.path ? activeTab.path.substring(0, activeTab.path.lastIndexOf('/')) : undefined}
                    extension={
                        // If we are in txt mode, suggest .txt. If MD, suggest .md
                        // FilePicker handles extension as default/fallback.
                        activeTab.context === 'txt' ? '.txt' : (activeTab.context === 'markdown' ? '.md' : `.${activeTab.context}`)
                    }
                    owner={activeUser}
                />
            )}

            <AlertDialog open={!!pendingCloseTabId} onOpenChange={(open) => !open && setPendingCloseTabId(null)}>
                <AlertDialogContent className="bg-[#1E1E1E] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('notepad.dialog.unsaved.title')}</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/70">
                            {t('notepad.dialog.unsaved.description')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <button
                            onClick={handleDiscardChanges}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-red-500 hover:text-red-400 hover:bg-white/5 h-9 px-4 py-2"
                        >
                            {t('notepad.dialog.unsaved.dontSave')}
                        </button>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">{t('notepad.dialog.unsaved.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleSaveChanges}
                            className="text-white hover:brightness-110"
                            style={{ backgroundColor: accentColor }}
                        >
                            {t('notepad.dialog.unsaved.save')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
import { AppMenuConfig } from '../../types';

export const notepadMenuConfig: AppMenuConfig = {
    menus: ['File', 'Edit', 'Format', 'View', 'Window', 'Help'],
    items: {
        'File': [
            { labelKey: 'notepad.menu.new', shortcut: '⌘N', action: 'new' },
            { labelKey: 'notepad.menu.open', shortcut: '⌘O', action: 'open' },
            { labelKey: 'notepad.menu.save', shortcut: '⌘S', action: 'save' },
            { type: 'separator' },
            { labelKey: 'notepad.menu.closeTab', shortcut: '⌘W', action: 'close-tab' },
        ],
        'Format': [
            { labelKey: 'notepad.menu.bold', shortcut: '⌘B', action: 'format-bold' },
            { labelKey: 'notepad.menu.italic', shortcut: '⌘I', action: 'format-italic' },
            { labelKey: 'notepad.menu.list', shortcut: '⌘L', action: 'format-list' },
            { type: 'separator' },
            { labelKey: 'notepad.menu.heading1', action: 'format-h1' },
            { labelKey: 'notepad.menu.heading2', action: 'format-h2' }
        ],
        'View': [
            { labelKey: 'notepad.menu.togglePreview', shortcut: '⌘P', action: 'toggle-preview' },
            { type: 'separator' },
            { labelKey: 'notepad.menu.zoomIn', shortcut: '⌘+', action: 'zoom-in' },
            { labelKey: 'notepad.menu.zoomOut', shortcut: '⌘-', action: 'zoom-out' }
        ]
    }
};

