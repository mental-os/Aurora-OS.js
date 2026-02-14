import { useState, useCallback, useEffect, useRef, useMemo, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup"; // HTML
import "prismjs/components/prism-bash"; // Bash/Shell
import "prismjs/themes/prism-tomorrow.css"; // Dark theme

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
  ChevronsUpDown,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/components/ui/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppTemplate } from "@/components/apps/AppTemplate";
import { useFileSystem } from "@/components/FileSystemContext";
import { FilePicker } from "@/components/ui/FilePicker";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { notify } from "@/services/notifications";

interface Tab {
  id: string;
  name: string;
  path?: string;
  content: string;
  isModified: boolean;
  context: string; // Dynamic language/context
  previewMode?: boolean;
}

// ... imports
import { useAppContext } from "@/components/AppContext";
import { useWindow } from "@/components/WindowContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { getAppStateKey } from "@/utils/memory";
import { useI18n } from "@/i18n/index";
import { safeParseLocal } from "@/utils/safeStorage";
import { useDebounce } from "@/hooks/useDebounce";

// ... interface

interface NotepadProps {
  id: string;
  owner?: string;
  initialPath?: string;
}

const extensionToLanguage = (ext: string): string => {
  switch (ext) {
    case "md":
      return "markdown";
    case "json":
      return "json";
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
      return "typescript";
    case "tsx":
      return "tsx";
    case "css":
      return "css";
    case "html":
    case "htm":
      return "markup";
    case "sh":
      return "bash";
    default:
      return "txt";
  }
};

const SUPPORTED_LANGUAGES = [
  { value: "markdown", labelKey: "notepad.languages.markdown" },
  { value: "javascript", labelKey: "notepad.languages.javascript" },
  { value: "typescript", labelKey: "notepad.languages.typescript" },
  { value: "tsx", labelKey: "notepad.languages.tsx" },
  { value: "json", labelKey: "notepad.languages.json" },
  { value: "css", labelKey: "notepad.languages.css" },
  { value: "markup", labelKey: "notepad.languages.markup" },
  { value: "bash", labelKey: "notepad.languages.bash" },
  { value: "txt", labelKey: "notepad.languages.txt" },
]; const TabItem = memo(({ tab, activeTabId, accentColor, onClick, onClose }: {
  tab: Tab;
  activeTabId: string | null;
  accentColor: string;
  onClick: (id: string) => void;
  onClose: (id: string, e: any) => void;
}) => {
  return (
    <div
      onClick={() => onClick(tab.id)}
      style={{
        borderColor: activeTabId === tab.id ? accentColor : "transparent",
        background:
          activeTabId === tab.id
            ? `linear-gradient(to top, ${accentColor}15, transparent)`
            : "transparent",
      }}
      className={`
          group flex items-center gap-2 px-4 py-2 text-xs font-medium cursor-pointer transition-all min-w-[140px] max-w-[220px] border-b-2
          ${activeTabId === tab.id
          ? "text-white"
          : "text-white/40 hover:text-white/80 hover:bg-white/5"
        }
      `}
    >
      <FileText
        className={`w-3.5 h-3.5 shrink-0 ${activeTabId === tab.id ? "opacity-100" : "opacity-50 group-hover:opacity-80"
          }`}
      />
      <span className={`truncate flex-1 ${tab.isModified ? "italic" : ""}`}>
        {tab.name}
        {tab.isModified ? "*" : ""}
      </span>
      <button
        onClick={(e) => onClose(tab.id, e)}
        className="opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-full p-0.5 transition-all"
      >
        <X className="w-3 h-3 text-white/70 hover:text-white" />
      </button>
    </div>
  );
});
TabItem.displayName = "TabItem";

const NotepadToolbar = memo(({
  titleBarBackground,
  blurStyle,
  tabs,
  activeTabId,
  accentColor,
  onTabClick,
  onTabClose,
  onNewTab,
  onOpenClick,
  onSaveClick,
  activeTab,
  isPreviewMode,
  insertMarkdown,
  t,
  onTogglePreview
}: any) => {
  return (
    <div className="flex flex-col w-full border-b border-white/10" style={{ background: titleBarBackground, ...blurStyle }}>
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2 px-2">
        {tabs.map((tab: any) => (
          <TabItem
            key={tab.id}
            tab={tab}
            activeTabId={activeTabId}
            accentColor={accentColor}
            onClick={onTabClick}
            onClose={onTabClose}
          />
        ))}
        <button
          onClick={onNewTab}
          className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between p-2 border-t border-white/5">
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenClick}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors flex items-center gap-2"
            title={t("notepad.actions.openFile")}
          >
            <FolderOpen className="w-4 h-4" />
          </button>
          <button
            onClick={onSaveClick}
            style={{ color: activeTab?.isModified ? accentColor : undefined }}
            disabled={!activeTab}
            className={`p-1.5 hover:bg-white/10 rounded-md transition-colors flex items-center gap-2 ${activeTab?.isModified ? "" : "text-white/70 hover:text-white"
              } disabled:opacity-20 disabled:cursor-not-allowed`}
            title={t("notepad.actions.saveFile")}
          >
            <Save className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/10 mx-2" />

          {!isPreviewMode && activeTab?.context === "markdown" && (
            <>
              <button
                onClick={() => insertMarkdown("bold")}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
                title={t("notepad.actions.bold")}
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown("italic")}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
                title={t("notepad.actions.italic")}
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown("list")}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
                title={t("notepad.actions.list")}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown("h1")}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
                title={t("notepad.actions.heading")}
              >
                <Type className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {activeTab &&
          (activeTab.context === "markdown" || activeTab.context === "markup") && (
            <button
              onClick={onTogglePreview}
              style={{ backgroundColor: isPreviewMode ? accentColor : undefined }}
              className={`
            flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
            ${isPreviewMode
                  ? "text-white"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }
        `}
            >
              {isPreviewMode ? (
                <>
                  <EyeOff className="w-3 h-3" />
                  {t("notepad.preview.edit")}
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" />
                  {t("notepad.preview.preview")}
                </>
              )}
            </button>
          )}
      </div>
    </div>
  );
});
const MarkdownPreview = memo(({ content, accentColor, onCopy, t }: any) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex-1 overflow-auto p-6! prose prose-invert max-w-none prose-pre:bg-[#0D0D0D]! prose-pre:p-6!">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node: _node, ...props }: any) => <h1 className="text-3xl font-bold mb-6 pb-2 border-b border-white/10" style={{ color: accentColor }} {...props} />,
              h2: ({ node: _node, ...props }: any) => <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: accentColor }} {...props} />,
              h3: ({ node: _node, ...props }: any) => <h3 className="text-xl font-bold mb-3 mt-6" style={{ color: accentColor }} {...props} />,
              p: ({ node: _node, ...props }: any) => <p className="mb-4 text-white/80 leading-relaxed" {...props} />,
              ul: ({ node: _node, ...props }: any) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
              ol: ({ node: _node, ...props }: any) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
              li: ({ node: _node, ...props }: any) => <li className="text-white/80" {...props} />,
              blockquote: ({ node: _node, ...props }: any) => <blockquote className="border-l-4 border-white/20 pl-4 italic my-6 text-white/60" {...props} />,
              code: ({ node: _node, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                  <div className="relative group my-6">
                    <div className="absolute top-0 right-0 px-3 py-1 text-[10px] text-white/30 font-mono bg-white/5 rounded-bl-lg uppercase">
                      {match[1]}
                    </div>
                    <pre className="bg-[#0D0D0D]! p-6! rounded-xl border border-white/5 overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
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
              a: ({ node: _node, ...props }: any) => <a className="text-blue-400 hover:underline" style={{ color: accentColor }} {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onCopy}>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {t("menubar.items.copy")}
          </div>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
});
MarkdownPreview.displayName = "MarkdownPreview";

const NotepadEditor = memo(({ content, context, onChange, onCopy, onCut, onPaste, t }: any) => {
  return (
    <div className="flex-1 overflow-y-auto relative font-mono text-sm prism-editor cursor-text text-white caret-white" onClick={() => {
      const textarea = document.querySelector('.prism-editor textarea') as HTMLElement;
      textarea?.focus();
    }}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="flex-1 flex flex-col min-h-0">
            <Editor
              value={content}
              onValueChange={onChange}
              highlight={code => Prism.highlight(code, Prism.languages[context] || Prism.languages.clike, context)}
              padding={20}
              style={{
                fontFamily: '"Fira Code", "Fira Mono", monospace',
                fontSize: 14,
                minHeight: '100%',
              }}
              className="flex-1 focus:outline-none focus-within:outline-none selection:bg-white/20"
            />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={onCopy}>
            {t("menubar.items.copy")}
          </ContextMenuItem>
          <ContextMenuItem onClick={onCut}>
            {t("menubar.items.cut")}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onPaste}>
            {t("menubar.items.paste")}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
});
NotepadEditor.displayName = "NotepadEditor";

export function Notepad({ id, owner, initialPath }: NotepadProps) {
  const { t } = useI18n();
  const { readFile, createFile, writeFile, getNodeAtPath } = useFileSystem();
  const { accentColor, activeUser: desktopUser } = useAppContext();
  const { titleBarBackground, blurStyle, windowBackground } = useThemeColors();
  const activeUser = owner || desktopUser;
  const windowContext = useWindow();

  const supportedLanguages = useMemo(
    () =>
      SUPPORTED_LANGUAGES.map((lang) => ({
        ...lang,
        label: t(lang.labelKey),
      })),
    [t]
  );

  const getLanguageDisplayName = useCallback(
    (context: string) => {
      const language = supportedLanguages.find((l) => l.value === context);
      if (language) return language.label;

      const unknown = context.charAt(0).toUpperCase() + context.slice(1);
      const key = `notepad.languages.${context}`;
      const translated = t(key);
      return translated === key ? unknown : translated;
    },
    [supportedLanguages, t]
  );

  const getUntitledTabName = useCallback(
    (index: number) => t("notepad.untitledTab", { index }),
    [t]
  );

  // State
  const [tabs, setTabs] = useState<Tab[]>(() => {
    // Initializer for lazy state loading
    try {
      if (!activeUser) return [];
      const key = getAppStateKey("notepad", activeUser);
      const parsed = safeParseLocal<{ tabs: Tab[] }>(key);
      if (parsed && Array.isArray(parsed.tabs)) {
        return parsed.tabs;
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  });

  // We also need to restore activeTabId
  const [activeTabId, setActiveTabId] = useState<string | null>(() => {
    try {
      if (!activeUser) return null;
      const key = getAppStateKey("notepad", activeUser);
      const parsed = safeParseLocal<{ activeTabId: string }>(key);
      if (parsed) {
        return parsed.activeTabId || null;
      }
    } catch {
      return null;
    }
    return null;
  });

  // Persist State Effect
  const stateToPersist = useMemo(() => ({ tabs, activeTabId }), [tabs, activeTabId]);
  const debouncedState = useDebounce(stateToPersist, 500);

  useEffect(() => {
    if (!activeUser) return;
    const key = getAppStateKey("notepad", activeUser);
    localStorage.setItem(key, JSON.stringify(debouncedState));
  }, [debouncedState, activeUser]);

  const [filePickerMode, setFilePickerMode] = useState<"open" | "save" | null>(
    null
  );

  // State for Unsaved Changes Dialog
  const [pendingCloseTabId, setPendingCloseTabId] = useState<string | null>(
    null
  );

  const activeTab = useMemo(() => tabs.find((t) => t.id === activeTabId) || (tabs.length > 0 ? tabs[0] : null), [tabs, activeTabId]);
  const isPreviewMode = useMemo(() => activeTab?.previewMode && (activeTab.context === "markdown" || activeTab.context === "markup"), [activeTab]);

  // -- Window Close Interception --
  // Using Ref for tabs to avoid effect re-running on every keystroke
  const tabsRef = useRef(tabs);
  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  useEffect(() => {
    if (!windowContext) return;

    const checkUnsaved = async (): Promise<boolean> => {
      const currentTabs = tabsRef.current;
      const modifiedTab = currentTabs.find((t) => t.isModified);
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
  const processedTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    tabsRefForOpening.current = tabs;
  }, [tabs]);

  useEffect(() => {
    const path = initialPath || windowContext?.data?.path;
    const timestamp = windowContext?.data?.timestamp;
    const isFresh = timestamp && (Date.now() - timestamp < 2000);

    // Logic: Only process if it's a new and fresh timestamp
    const isNewTimestamp = timestamp && timestamp !== processedTimestampRef.current;

    if (path && isNewTimestamp && isFresh) {
      if (timestamp) processedTimestampRef.current = timestamp;

      // Use ref to avoid closure staleness and dependency on tabs
      const currentTabs = tabsRefForOpening.current;
      const existingTab = currentTabs.find((t) => t.path === path);

      if (existingTab) {
        // Use setTimeout to avoid synchronous setState during effect execution (cascading render)
        const tid = existingTab.id;
        setTimeout(() => setActiveTabId(tid), 0);
      } else {
        // Open new tab
        const node = getNodeAtPath(path, activeUser);
        if (node && node.type === "file") {
          const name = node.name;
          const newId = node.id;

          // Read content with user context
          const content = readFile(path, activeUser) || "";
          const extension = name.split(".").pop()?.toLowerCase() || "";
          const context = extensionToLanguage(extension);

          const newTab: Tab = {
            id: newId,
            name,
            path,
            content,
            isModified: false,
            context,
            previewMode: false,
          };

          // If the only tab was the initial blank "Untitled 1" and it was empty/unmodified, replace it.
          setTimeout(() => {
            setTabs((prev) => {
              if (
                prev.length === 1 &&
                !prev[0].path &&
                !prev[0].isModified &&
                prev[0].content === ""
              ) {
                return [newTab];
              }
              if (prev.find((t) => t.id === newId)) return prev;
              return [...prev, newTab];
            });
            setActiveTabId(newId);
          }, 0);
        }
      }
    }
  }, [windowContext?.data, initialPath, activeUser, readFile, getNodeAtPath]);

  // -- Tab Management --
  const handleNewTab = useCallback(() => {
    const newId = crypto.randomUUID();
    const newName = getUntitledTabName(tabs.length + 1);
    setTabs((prev) => [
      ...prev,
      {
        id: newId,
        name: newName,
        content: "",
        isModified: false,
        context: "markdown",
        previewMode: false,
      },
    ]);
    setActiveTabId(newId);
  }, [tabs.length, getUntitledTabName]);

  const forceCloseTab = useCallback(
    (id: string) => {
      const newTabs = tabs.filter((t) => t.id !== id);
      setTabs(newTabs);
      if (activeTabId === id) {
        setActiveTabId(
          newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null
        );
      }
      setPendingCloseTabId(null);
    },
    [tabs, activeTabId, setTabs, setActiveTabId, setPendingCloseTabId]
  );

  const handleCloseTab = useCallback(
    (id: string, e: React.MouseEvent | { stopPropagation: () => void }) => {
      e.stopPropagation();
      const tabToClose = tabs.find((t) => t.id === id);
      if (!tabToClose) return;

      if (tabToClose.isModified) {
        setActiveTabId(id); // Switch to it so context is right
        setPendingCloseTabId(id);
      } else {
        forceCloseTab(id);
      }
    },
    [tabs, forceCloseTab, setActiveTabId, setPendingCloseTabId]
  );

  const handleContentChange = useCallback(
    (newContent: string) => {
      setTabs((prevTabs) =>
        prevTabs.map((t) =>
          t.id === activeTabId
            ? { ...t, content: newContent, isModified: true }
            : t
        )
      );
    },
    [activeTabId]
  );

  // -- File I/O --
  const handleFileSelect = (path: string) => {
    if (filePickerMode === "open") {
      const node = getNodeAtPath(path, activeUser);
      if (!node || node.type !== "file") return;

      const content = readFile(path, activeUser);
      if (content !== null) {
        const name = path.split("/").pop() || t("notepad.untitled");
        const extension = name.split(".").pop()?.toLowerCase() || "";
        const context = extensionToLanguage(extension);

        // Check if we should replace current empty tab or open new
        if (
          activeTab &&
          activeTab.content === "" &&
          !activeTab.path &&
          !activeTab.isModified
        ) {
          setTabs(
            tabs.map((t) =>
              t.id === activeTabId
                ? { ...t, name, path, content, isModified: false, context }
                : t
            )
          );
        } else {
          const newId = crypto.randomUUID();
          setTabs([
            ...tabs,
            {
              id: newId,
              name,
              path,
              content,
              isModified: false,
              context,
              previewMode: false,
            },
          ]);
          setActiveTabId(newId);
        }
      } else {
        notify.system(
          "error",
          "Notepad",
          t("notepad.toasts.failedToReadFile"),
          t("notifications.subtitles.error")
        );
      }
    } else if (filePickerMode === "save") {
      if (!activeTab) return;
      // Save logic
      // Try updating first (overwrite), then create if distinct
      let success = writeFile(path, activeTab.content, activeUser);

      if (!success) {
        // If writeFile failed, maybe it doesn't exist, try create
        const name = path.split("/").pop() || t("notepad.untitled");
        const dir = path.substring(0, path.lastIndexOf("/")) || "/";
        success = createFile(dir, name, activeTab.content, activeUser);
      }

      if (success) {
        const name = path.split("/").pop() || t("notepad.untitled");
        // Update context based on saved extension
        const extension = name.split(".").pop()?.toLowerCase() || "";
        const context = extensionToLanguage(extension);

        setTabs(
          tabs.map((t) =>
            t.id === activeTabId
              ? { ...t, name, path, isModified: false, context }
              : t
          )
        );
        notify.system(
          "success",
          "Notepad",
          t("notepad.toasts.fileSaved"),
          t("notifications.subtitles.saved")
        );
      } else {
        notify.system(
          "error",
          "Notepad",
          t("notepad.toasts.failedToSaveFilePermissions"),
          t("notifications.subtitles.error")
        );
      }
    }
    setFilePickerMode(null);
  };

  const handleSave = useCallback(() => {
    if (!activeTab) return false;
    if (activeTab.path) {
      // Quick Save using writeFile (updates existing)
      const success = writeFile(activeTab.path, activeTab.content, activeUser);
      if (success) {
        setTabs((prevTabs) =>
          prevTabs.map((t) =>
            t.id === activeTabId ? { ...t, isModified: false } : t
          )
        );
        notify.system(
          "success",
          "Notepad",
          t("notepad.toasts.saved"),
          t("notifications.subtitles.saved")
        );
        return true; // Indicate success for quick save
      } else {
        notify.system(
          "error",
          "Notepad",
          t("notepad.toasts.failedToSave"),
          t("notifications.subtitles.error")
        );
        return false;
      }
    } else {
      setFilePickerMode("save");
      return false; // FilePicker will handle the actual save
    }
  }, [activeTab, activeTabId, activeUser, t, writeFile, setFilePickerMode]);

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
    if (activeTab?.path) {
      // It will save synchronously in handleSave
      // We can force close after?
      // Actually handleSave updates state.
      // We'll trust the user to close after saving, or we can try to chain it.
      // Let's just dismiss dialog and save.
      setPendingCloseTabId(null);
      if (saved && activeTabId) {
        // If it was a quick save and successful, then close the tab
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
  const insertMarkdown = useCallback(
    (syntax: string) => {
      if (!activeTab) return;
      const textarea = document.querySelector(
        ".prism-editor textarea"
      ) as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = activeTab.content;
      const before = text.substring(0, start);
      const selection = text.substring(start, end);
      const after = text.substring(end);

      let newContent: string;

      switch (syntax) {
        case "bold":
          newContent = `${before}**${selection || "text"}**${after}`;
          break;
        case "italic":
          newContent = `${before}_${selection || "text"}_${after}`;
          break;
        case "list":
          newContent = `${before}\n- ${selection}${after}`;
          break;
        case "h1":
          newContent = `${before}\n# ${selection}${after}`;
          break;
        default:
          return;
      }

      handleContentChange(newContent);
      setTimeout(() => {
        textarea.focus();
      }, 0);
    },
    [activeTab, handleContentChange]
  );

  // -- Context Menu Actions --
  const handleCopy = useCallback(() => {
    document.execCommand("copy");
  }, []);

  const handleCut = useCallback(() => {
    document.execCommand("cut");
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && activeTabId) {
        // We need to inject text at cursor. For Editor, we could potentially use its inner state but
        // easiest is to let the browser handle standard paste if possible, but radix context menu
        // intercepts it. We'll use a simple approach for now.
        document.execCommand("insertText", false, text);
      }
    } catch (err) {
      console.error("Failed to paste:", err);
    }
  }, [activeTabId]);

  // -- Stable Menu Action Handler --
  const actionHandlers = useRef({
    handleNewTab,
    setFilePickerMode,
    activeTab,
    activeTabId,
    handleCloseTab,
    handleCopy,
    handlePaste,
    insertMarkdown,
    setTabs
  });

  useEffect(() => {
    actionHandlers.current = {
      handleNewTab,
      setFilePickerMode,
      activeTab,
      activeTabId,
      handleCloseTab,
      handleCopy,
      handlePaste,
      insertMarkdown,
      setTabs
    };
  }, [handleNewTab, setFilePickerMode, activeTab, activeTabId, handleCloseTab, handleCopy, handlePaste, insertMarkdown, setTabs]);

  useEffect(() => {
    const handleMenuAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { action, appId, windowId } = customEvent.detail;
      if (appId !== "notepad" || (windowId && windowId !== id)) return;

      const handlers = actionHandlers.current;
      if (action === "new") {
        handlers.handleNewTab();
        return;
      }
      if (action === "open") {
        handlers.setFilePickerMode("open");
        return;
      }

      if (!handlers.activeTab) return;

      switch (action) {
        case "close-tab":
          if (handlers.activeTabId) {
            handlers.handleCloseTab(handlers.activeTabId, { stopPropagation: () => { } });
          }
          break;
        case "copy":
          handlers.handleCopy();
          break;
        case "paste":
          handlers.handlePaste();
          break;
        case "format-bold":
          handlers.insertMarkdown("bold");
          break;
        case "format-italic":
          handlers.insertMarkdown("italic");
          break;
        case "format-list":
          handlers.insertMarkdown("list");
          break;
        case "format-h1":
          handlers.insertMarkdown("h1");
          break;
        case "toggle-preview":
          handlers.setTabs((prevTabs) =>
            prevTabs.map((t) =>
              t.id === handlers.activeTabId ? { ...t, previewMode: !t.previewMode } : t
            )
          );
          break;
      }
    };

    window.addEventListener("app-menu-action", handleMenuAction);
    return () => window.removeEventListener("app-menu-action", handleMenuAction);
  }, [id]);

  return (
    <div className="relative h-full w-full">
      <AppTemplate
        hasSidebar={false}
        content={
          <div className="h-full flex flex-col relative">
            <NotepadToolbar
              titleBarBackground={titleBarBackground}
              blurStyle={blurStyle}
              tabs={tabs}
              activeTabId={activeTabId}
              accentColor={accentColor}
              onTabClick={setActiveTabId}
              onTabClose={handleCloseTab}
              onNewTab={handleNewTab}
              onOpenClick={() => setFilePickerMode("open")}
              onSaveClick={handleSave}
              activeTab={activeTab}
              isPreviewMode={isPreviewMode}
              insertMarkdown={insertMarkdown}
              t={t}
              onTogglePreview={() => {
                setTabs((prevTabs) =>
                  prevTabs.map((t) =>
                    t.id === activeTabId
                      ? { ...t, previewMode: !t.previewMode }
                      : t
                  )
                );
              }}
            />

            {tabs.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  icon={FileText}
                  title={t("notepad.empty.title")}
                  description={t("notepad.empty.description")}
                  action={
                    <div className="flex gap-3">
                      <button
                        onClick={handleNewTab}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {t("notepad.empty.newFile")}
                      </button>
                      <button
                        onClick={() => setFilePickerMode("open")}
                        style={{ backgroundColor: accentColor }}
                        className="px-4 py-2 rounded-lg text-white text-sm transition-all flex items-center gap-2 hover:brightness-110"
                      >
                        <FolderOpen className="w-4 h-4" />
                        {t("notepad.empty.openFile")}
                      </button>
                    </div>
                  }
                />
              </div>
            ) : (
              activeTab &&
              (isPreviewMode ? (
                activeTab.context === "markdown" ? (
                  <MarkdownPreview
                    content={activeTab.content}
                    accentColor={accentColor}
                    onCopy={handleCopy}
                    t={t}
                  />
                ) : (
                  <div className="flex-1 overflow-hidden">
                    <iframe
                      srcDoc={activeTab.content}
                      title={t("notepad.preview.htmlPreviewTitle")}
                      sandbox="allow-scripts"
                      className="w-full h-full border-none bg-white"
                    />
                  </div>
                )
              ) : (
                <NotepadEditor
                  content={activeTab.content}
                  context={activeTab.context}
                  onChange={handleContentChange}
                  onCopy={handleCopy}
                  onCut={handleCut}
                  onPaste={handlePaste}
                  t={t}
                />
              ))
            )}

            {activeTab && (
              <div className="h-6 border-t border-white/5 flex items-center justify-between px-3 text-[10px] text-white/30 select-none bg-white/5">
                <div className="flex gap-4">
                  <span>
                    {t("notepad.status.chars", {
                      count: activeTab.content.length,
                    })}
                  </span>
                  <span>
                    {t("notepad.status.lines", {
                      count: activeTab.content.split("\n").length,
                    })}
                  </span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <div
                      className="font-mono hover:text-white cursor-pointer transition-colors select-none flex items-center gap-1"
                      style={{
                        color: "rgba(255, 255, 255, 0.5)",
                      }}
                      title={t("notepad.contextSwitcher.title")}
                    >
                      {getLanguageDisplayName(activeTab.context)}
                      <ChevronsUpDown className="size-3 opacity-50" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[200px] p-0 z-10001"
                    align="end"
                    style={{
                      background: "rgba(28, 28, 30, 0.95)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    <Command className="bg-transparent text-white">
                      <CommandInput
                        placeholder={t(
                          "notepad.contextSwitcher.searchPlaceholder"
                        )}
                        className="h-8 text-[11px] border-b border-white/10"
                        style={{
                          color: "white",
                          caretColor: accentColor,
                        }}
                      />
                      <CommandList className="max-h-[200px]">
                        <CommandEmpty className="text-[11px] py-2 text-white/40">
                          {t("notepad.contextSwitcher.noLanguageFound")}
                        </CommandEmpty>
                        <CommandGroup>
                          {supportedLanguages.map((lang) => (
                            <CommandItem
                              key={lang.value}
                              value={lang.value}
                              onSelect={(currentValue) => {
                                setTabs(
                                  tabs.map((t) =>
                                    t.id === activeTabId
                                      ? { ...t, context: currentValue }
                                      : t
                                  )
                                );
                                notify.system(
                                  "success",
                                  "Notepad",
                                  t("notepad.toasts.switchedTo", {
                                    language: lang.label,
                                  }),
                                  t("notifications.subtitles.ui")
                                );
                              }}
                              className="text-[11px] cursor-pointer transition-all duration-150"
                              style={{
                                color:
                                  activeTab.context === lang.value
                                    ? accentColor
                                    : "rgba(255, 255, 255, 0.7)",
                                backgroundColor:
                                  activeTab.context === lang.value
                                    ? `${accentColor}15`
                                    : "transparent",
                              }}
                              onMouseEnter={(e) => {
                                if (activeTab.context !== lang.value) {
                                  e.currentTarget.style.backgroundColor =
                                    "rgba(255, 255, 255, 0.05)";
                                  e.currentTarget.style.color = "white";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (activeTab.context !== lang.value) {
                                  e.currentTarget.style.backgroundColor =
                                    "transparent";
                                  e.currentTarget.style.color =
                                    "rgba(255, 255, 255, 0.7)";
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-3 w-3 transition-opacity",
                                  activeTab.context === lang.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                                style={{
                                  color: accentColor,
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
            )}
          </div>
        }
      />
      {filePickerMode && (
        <FilePicker
          isOpen={true}
          mode={filePickerMode}
          onClose={() => setFilePickerMode(null)}
          onSelect={handleFileSelect}
          defaultPath={
            activeTab && activeTab.path
              ? activeTab.path.substring(0, activeTab.path.lastIndexOf("/"))
              : undefined
          }
          extension={
            // If we are in txt mode, suggest .txt. If MD, suggest .md
            // FilePicker handles extension as default/fallback.
            activeTab
              ? activeTab.context === "txt"
                ? ".txt"
                : activeTab.context === "markdown"
                  ? ".md"
                  : `.${activeTab.context}`
              : ".txt"
          }
          owner={activeUser}
        />
      )}

      <AlertDialog
        open={!!pendingCloseTabId}
        onOpenChange={(open) => !open && setPendingCloseTabId(null)}
      >
        <AlertDialogContent
          overlayClassName="bg-black/20 backdrop-blur-[12px]"
          className="border-white/10 text-white bg-transparent shadow-2xl"
          style={{
            background: windowBackground,
            ...blurStyle
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("notepad.dialog.unsaved.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              {t("notepad.dialog.unsaved.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <button
              onClick={handleDiscardChanges}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-red-500 hover:text-red-400 hover:bg-white/5 h-9 px-4 py-2"
            >
              {t("notepad.dialog.unsaved.dontSave")}
            </button>
            <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">
              {t("notepad.dialog.unsaved.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveChanges}
              className="text-white hover:brightness-110"
              style={{ backgroundColor: accentColor }}
            >
              {t("notepad.dialog.unsaved.save")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


