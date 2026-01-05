import { useState, useMemo } from 'react';
import { Dialog, DialogContent } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { useFileSystem, FileNode } from '../FileSystemContext';
import { FileIcon } from './FileIcon';
import { ArrowUp, FolderOpen } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import { cn } from './utils';
import { toast } from 'sonner';
import { checkPermissions } from '../../utils/fileSystemUtils';
import { BreadcrumbPill } from './BreadcrumbPill';
import { ResponsiveGrid } from './ResponsiveGrid';
import { useI18n } from '../../i18n/index';

interface FilePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (path: string) => void;
    mode: 'open' | 'save';
    title?: string;
    defaultPath?: string;
    extension?: string;
    owner?: string;
}

export function FilePicker({ isOpen, onClose, onSelect, mode, title, defaultPath, extension, owner }: FilePickerProps) {
    const { listDirectory, getNodeAtPath, users, currentUser, resolvePath } = useFileSystem();
    const actingUser = (owner || currentUser) ?? undefined;
    const { accentColor } = useAppContext();
    const { windowBackground, titleBarBackground, blurStyle } = useThemeColors();
    const { t } = useI18n();

    const [currentPath, setCurrentPath] = useState(defaultPath || resolvePath('~', actingUser));
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [filename, setFilename] = useState('');

    const items = useMemo(() => {
        const allItems = listDirectory(currentPath, actingUser) || [];
        return allItems
            .filter(item => !item.name.startsWith('.'))
            .sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'directory' ? -1 : 1;
            });
    }, [currentPath, listDirectory, actingUser]);

    const handleNavigate = (path: string) => {
        const node = getNodeAtPath(path, actingUser);

        if (node) {
            const userObj = users.find(u => u.username === actingUser);
            if (userObj) {
                if (!checkPermissions(node, userObj, 'read')) {
                    toast.error(t('filePicker.toasts.permissionDenied', { name: node.name }));
                    return;
                }
                if (!checkPermissions(node, userObj, 'execute')) {
                    toast.error(t('filePicker.toasts.permissionDenied', { name: node.name }));
                    return;
                }
            }
        }

        setCurrentPath(path);
        setSelectedItem(null);
    };

    const handleUp = () => {
        if (currentPath === '/') return;
        const parent = currentPath.split('/').slice(0, -1).join('/') || '/';
        handleNavigate(parent);
    };

    const handleItemClick = (item: FileNode) => {
        if (item.type === 'directory') {
            setSelectedItem(item.id);
        } else {
            setSelectedItem(item.id);
            setFilename(item.name);
        }
    };

    const handleItemDoubleClick = (item: FileNode) => {
        if (item.type === 'directory') {
            const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
            handleNavigate(newPath);
        } else {
            if (mode === 'open') {
                onSelect(currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`);
                onClose();
            }
        }
    };

    const handleConfirm = () => {
        if (mode === 'open') {
            if (selectedItem) {
                const item = items.find(i => i.id === selectedItem);
                if (item && item.type === 'file') {
                    onSelect(currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`);
                    onClose();
                }
            }
        } else {
            if (!filename) return;
            let finalName = filename;
            if (extension && !finalName.includes('.')) {
                finalName += extension;
            }
            onSelect(currentPath === '/' ? `/${finalName}` : `${currentPath}/${finalName}`);
            onClose();
        }
    };

    const isSelectionValid = useMemo(() => {
        if (mode === 'save') return !!filename;
        if (!selectedItem) return false;
        const item = items.find(i => i.id === selectedItem);
        return item ? item.type === 'file' : false;
    }, [mode, filename, selectedItem, items]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="sm:max-w-3xl border-white/20 text-white h-[500px] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl rounded-xl [&>button]:hidden bg-transparent"
                style={{
                    background: windowBackground,
                    ...blurStyle
                }}
            >
                {/* Custom Window Header */}
                <div
                    className="h-11 border-b border-white/10 flex items-center justify-between px-4 shrink-0 select-none relative"
                    style={{ background: titleBarBackground }}
                >
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors group flex items-center justify-center p-0"
                        >
                            <span className="opacity-0 group-hover:opacity-100 text-black/50 font-bold text-[8px] leading-none"></span>
                        </button>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20" />
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 text-sm text-white/90 font-medium pointer-events-none">
                        {title || (mode === 'open' ? t('filePicker.openFile') : t('filePicker.saveFile'))}
                    </div>
                </div>

                <div className="flex flex-col flex-1 min-h-0">
                    {/* Navigation Bar */}
                    <div className="flex items-center gap-2 p-2 px-3 border-b border-white/5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
                            onClick={handleUp}
                            disabled={currentPath === '/'}
                        >
                            <ArrowUp className="h-4 w-4" />
                        </Button>

                        <div className="flex-1 overflow-x-auto no-scrollbar mask-linear-fade">
                            <div className="flex items-center gap-1.5 min-w-max">
                                {currentPath === '/' ? (
                                    <BreadcrumbPill
                                        name="/"
                                        isLast={true}
                                        accentColor={accentColor}
                                        onClick={() => { }}
                                    />
                                ) : (
                                    (() => {
                                        const parts = currentPath.split('/').filter(Boolean);
                                        let cumulativePath = '';
                                        return parts.map((part, index) => {
                                            cumulativePath += `/${part}`;
                                            const isLast = index === parts.length - 1;
                                            const path = cumulativePath;
                                            return (
                                                <BreadcrumbPill
                                                    key={path}
                                                    name={part}
                                                    isLast={isLast}
                                                    accentColor={accentColor}
                                                    onClick={() => handleNavigate(path)}
                                                />
                                            );
                                        });
                                    })()
                                )}
                            </div>
                        </div>
                    </div>

                    {/* File List */}
                    <div className="flex-1 overflow-y-auto p-4"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setSelectedItem(null);
                        }}
                    >
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-white/40">
                                <FolderOpen className="w-12 h-12 mb-4 opacity-50" />
                                <p>{t('filePicker.emptyFolder')}</p>
                            </div>
                        ) : (
                            <ResponsiveGrid minItemWidth={100} className="gap-4">
                                {items.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleItemClick(item);
                                        }}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            handleItemDoubleClick(item);
                                        }}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-lg transition-colors group relative border border-transparent",
                                            selectedItem === item.id ? "bg-white/10 border-white/5" : "hover:bg-white/5"
                                        )}
                                    >
                                        <div className="w-14 h-14 flex items-center justify-center pointer-events-none transition-transform group-hover:scale-105">
                                            <FileIcon
                                                name={item.name}
                                                type={item.type}
                                                accentColor={accentColor}
                                                isEmpty={item.children?.length === 0}
                                            />
                                        </div>
                                        <div className="w-full text-center pointer-events-none">
                                            <div className="text-xs text-white/90 truncate w-full px-1">
                                                {item.name}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </ResponsiveGrid>
                        )}
                    </div>

                    {/* Footer / Input */}
                    <div className="p-4 border-t border-white/5 bg-white/5 flex items-center gap-4">
                        {mode === 'save' ? (
                            <div className="flex items-center gap-3 flex-1 w-full">
                                <span className="text-sm text-white/70 whitespace-nowrap">{t('filePicker.nameLabel')}</span>
                                <Input
                                    value={filename}
                                    onChange={(e) => setFilename(e.target.value)}
                                    placeholder={t('filePicker.untitledPlaceholder')}
                                    className="h-8 bg-black/20 border-white/10 text-white focus:border-white/20 rounded-md"
                                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                                />
                            </div>
                        ) : <div className="flex-1" />}

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                style={{
                                    '--accent-color': accentColor,
                                } as React.CSSProperties}
                                className="h-8 border-(--accent-color) text-(--accent-color) hover:bg-(--accent-color) hover:text-white px-4 rounded-md bg-transparent transition-all duration-200"
                            >
                                {t('filePicker.cancel')}
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                style={{
                                    backgroundColor: accentColor,
                                    boxShadow: `0 0 15px ${accentColor}40`
                                }}
                                className="h-8 text-white hover:brightness-110 px-6 rounded-md border border-white/10 font-medium transition-all"
                                disabled={!isSelectionValid}
                            >
                                {mode === 'open' ? t('filePicker.open') : t('filePicker.save')}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
