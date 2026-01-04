import { useRef, useEffect, ReactNode, useMemo, memo } from 'react';
import { AppTemplate } from './AppTemplate';
import pkg from '../../../package.json';
import { useTerminalLogic } from '../../hooks/useTerminalLogic';

export interface TerminalProps {
  onLaunchApp?: (appId: string, args: string[], owner?: string) => void;
  owner?: string;
}

export function Terminal({ onLaunchApp, owner }: TerminalProps) {
  const {
    input,
    setInput,
    history,
    activeTerminalUser,
    currentPath,
    ghostText,
    termAccent,
    shades,
    handleKeyDown,
    isCommandValid,
    homePath,
    promptState
  } = useTerminalLogic(onLaunchApp, owner);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Smart Scroll
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const getPrompt = (path: string = currentPath) => {
    if (promptState) {
      return (
        <span className="whitespace-nowrap mr-1">
          <span style={{ color: 'white' }}>{promptState.message}</span>
        </span>
      );
    }

    let displayPath: string;
    if (path === homePath) {
      displayPath = '~';
    } else if (path.startsWith(homePath + '/')) {
      displayPath = '~' + path.slice(homePath.length);
    } else {
      displayPath = path;
    }

    return (
      <span className="whitespace-nowrap mr-2">
        <span style={{ color: termAccent }}>{activeTerminalUser}</span>
        <span style={{ color: '#94a3b8' }}>@</span>
        <span style={{ color: termAccent }}>aurora</span>
        <span style={{ color: '#94a3b8' }}>:</span>
        <span style={{ color: '#60a5fa' }}>{displayPath}</span>
        <span style={{ color: termAccent }}>{activeTerminalUser === 'root' ? '#' : '$'}</span>
      </span>
    );
  };

  const inputOverlay = useMemo(() => {
    if (promptState?.type === 'password') {
      return null;
    }
    const tokens: ReactNode[] = [];
    const regex = /("([^"]*)")|('([^']*)')|(\s+)|([^\s"']+)/g;
    let match;
    let index = 0;
    let isCommandPosition = true;

    while ((match = regex.exec(input)) !== null) {
      const fullMatch = match[0];
      const isString = match[1] !== undefined || match[3] !== undefined;
      const isWhitespace = match[5] !== undefined;
      const isWord = match[6] !== undefined;

      let color = 'white';

      if (isWhitespace) {
        tokens.push(<span key={index++} className="whitespace-pre">{fullMatch}</span>);
        continue;
      }

      if (isCommandPosition && isWord) {
        const isValid = isCommandValid(fullMatch);
        color = isValid ? shades.base : '#ef4444';
        isCommandPosition = false;
      } else if (isString) {
        color = shades.lightest;
      } else if (fullMatch.startsWith('-')) {
        color = shades.light;
      } else if (['>', '>>', '|', '&&', ';'].includes(fullMatch)) {
        color = shades.light;
        if (['|', '&&', ';'].includes(fullMatch)) isCommandPosition = true;
      } else {
        color = 'white';
      }

      tokens.push(
        <span key={index++} style={{ color }}>{fullMatch}</span>
      );
    }

    return (
      <span className="pointer-events-none whitespace-pre relative z-10 break-all">
        {tokens}
        <span className="text-white/40">{ghostText}</span>
      </span>
    );
  }, [input, isCommandValid, shades, ghostText, promptState?.type]);

  const content = (
    <div
      className="flex-1 overflow-y-auto p-2 font-mono text-sm space-y-1 scrollbar-hide"
      ref={terminalRef}
      onClick={() => {
        const selection = window.getSelection();
        if (!selection || selection.toString().length === 0) {
          inputRef.current?.focus();
        }
      }}
    >
      <div className="text-gray-400 mb-2">{pkg.build.productName} terminal [v{pkg.version}]</div>

      {history.map((item) => (
        <TerminalHistoryItem
          key={item.id}
          item={item}
          homePath={homePath}
          activeUser={activeTerminalUser}
        />
      ))}

      <div className="flex relative">
        {getPrompt()}

        <div className="relative flex-1 group">
          <div className="absolute inset-0 top-0 left-0 pointer-events-none select-none whitespace-pre break-all">
            {inputOverlay}
          </div>
          <input
            ref={inputRef}
            type={promptState?.type === 'password' ? 'password' : 'text'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent outline-none text-transparent caret-white relative z-20 break-all"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );

  return <AppTemplate content={content} hasSidebar={false} contentClassName="overflow-hidden bg-[#1e1e1e]/90" />;
}

// Memoized History Item
interface TerminalHistoryItemProps {
  item: {
    id: string;
    command: string;
    output: ReactNode[];
    path: string;
    user?: string;
    error?: boolean;
    accentColor?: string;
  };
  homePath: string;
  activeUser: string;
}

const TerminalHistoryItem = memo(function TerminalHistoryItem({ item, homePath, activeUser }: TerminalHistoryItemProps) {
  const displayPath = item.path.replace(homePath, '~');
  const user = item.user || activeUser;
  const promptSymbol = user === 'root' ? '#' : '$';

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2" style={{ color: item.accentColor || '#4ade80' }}>
        {item.user && item.user.includes(':') ? (
          <span className="text-white">{item.user}</span>
        ) : (
          <span>
            {user}@{`aurora:${displayPath}${promptSymbol}`}
          </span>
        )}
        <span className="text-gray-100">{item.command}</span>
      </div>
      <div className="pl-0">
        {item.output.map((line, lineIndex) => (
          <div
            key={lineIndex}
            className={item.error ? 'text-red-400' : 'text-white/80'}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
});

import { AppMenuConfig } from '../../types';

export const terminalMenuConfig: AppMenuConfig = {
  menus: ['Shell', 'Edit', 'View', 'Window', 'Help'],
  items: {
    'Shell': [
      { label: 'New Tab', labelKey: 'terminal.menu.newTab', shortcut: '⌘T', action: 'new-tab' },
      { label: 'New Window', labelKey: 'menubar.items.newWindow', shortcut: '⌘N', action: 'new-window' },
      { type: 'separator' },
      { label: 'Clear Scrollback', labelKey: 'terminal.menu.clearScrollback', shortcut: '⌘K', action: 'clear' },
      { type: 'separator' },
      { label: 'Close Window', labelKey: 'menubar.items.closeWindow', shortcut: '⌘W', action: 'close-window' }
    ],
    'Edit': [
      { label: 'Copy', labelKey: 'menubar.items.copy', shortcut: '⌘C', action: 'copy' },
      { label: 'Paste', labelKey: 'menubar.items.paste', shortcut: '⌘V', action: 'paste' },
      { label: 'Select All', labelKey: 'menubar.items.selectAll', shortcut: '⌘A', action: 'select-all' }
    ]
  }
};
