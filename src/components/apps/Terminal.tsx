import { useState, useRef, useEffect, ReactNode } from 'react';
import { useFileSystem } from '../FileSystemContext';
import { useAppContext } from '../AppContext';
import { AppTemplate } from './AppTemplate';
// FileIcon and checkPermissions removed as they are now used inside command modules
import { getCommand, commands, getAllCommands } from '../../utils/terminal/registry';
import pkg from '../../../package.json';

interface CommandHistory {
  command: string;
  output: (string | ReactNode)[];
  error?: boolean;
  path: string;
  accentColor?: string;
  user?: string;
}

const PATH = ['/bin', '/usr/bin'];
// const BUILTINS = ['cd', 'export', 'alias']; // Replaced by registry

export interface TerminalProps {
  onLaunchApp?: (appId: string, args: string[]) => void;
}

export function Terminal({ onLaunchApp }: TerminalProps) {
  const { accentColor } = useAppContext();
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [input, setInput] = useState('');
  // Persistent command history (independent of visual history clearing)
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const {
    listDirectory,
    getNodeAtPath,
    createFile,
    createDirectory,
    moveToTrash,
    readFile,
    resolvePath: contextResolvePath,
    homePath,
    currentUser,
    users,
    groups,
    moveNode,
    login,
    logout,
    resetFileSystem,
    chmod,
    chown,
    writeFile
  } = useFileSystem();

  const [ghostText, setGhostText] = useState('');

  // Session Stack for su/sudo (independent of global desktop session)
  // Stack of usernames. Top is current.
  const [sessionStack, setSessionStack] = useState<string[]>([]);

  // Initialize session with current global user
  useEffect(() => {
    if (sessionStack.length === 0 && currentUser) {
      setSessionStack([currentUser]);
    }
  }, [currentUser, sessionStack.length]);

  const activeTerminalUser = sessionStack.length > 0 ? sessionStack[sessionStack.length - 1] : (currentUser || 'guest');

  const pushSession = (username: string) => {
    setSessionStack(prev => [...prev, username]);
  };

  const closeSession = () => {
    setSessionStack(prev => {
      if (prev.length > 1) return prev.slice(0, -1);
      return prev;
    });
  };

  // Each Terminal instance has its own working directory (independent windows)
  const [currentPath, setCurrentPath] = useState(homePath);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Use context's resolvePath but with our local currentPath
  const resolvePath = (path: string): string => {
    if (path.startsWith('/')) return contextResolvePath(path);
    if (path === '~') return homePath;
    if (path.startsWith('~/')) return homePath + path.slice(1);

    // Handle relative paths from our local currentPath
    const parts = currentPath.split('/').filter(p => p);
    const pathParts = path.split('/');

    for (const part of pathParts) {
      if (part === '..') {
        parts.pop();
      } else if (part !== '.' && part !== '') {
        parts.push(part);
      }
    }
    return '/' + parts.join('/');
  };

  // Helper to expand globs like *.txt
  const expandGlob = (pattern: string): string[] => {
    if (!pattern.includes('*')) {
      return [pattern];
    }
    const resolvedPath = resolvePath(currentPath);
    if (pattern.includes('/')) {
      return [pattern];
    }
    const files = listDirectory(resolvedPath, activeTerminalUser);
    if (!files) return [pattern]; // Fail gracefully

    const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
    const matches = files
      .filter(f => regex.test(f.name))
      .map(f => f.name);

    return matches.length > 0 ? matches : [pattern];
  };

  const getAutocompleteCandidates = (partial: string, isCommand: boolean): string[] => {
    const candidates: string[] = [];
    if (isCommand) {
      candidates.push(...Object.keys(commands).filter(c => c.startsWith(partial)));
      for (const pathDir of PATH) {
        const files = listDirectory(pathDir, activeTerminalUser);
        if (files) {
          files.forEach(f => {
            if (f.name.startsWith(partial) && f.type === 'file') {
              candidates.push(f.name);
            }
          });
        }
      }
    } else {
      let searchDir = currentPath;
      let searchPrefix = partial;
      const lastSlash = partial.lastIndexOf('/');
      if (lastSlash !== -1) {
        const dirPart = partial.substring(0, lastSlash);
        searchPrefix = partial.substring(lastSlash + 1);
        searchDir = resolvePath(dirPart);
      }
      const files = listDirectory(searchDir, activeTerminalUser);
      if (files) {
        files.forEach(f => {
          if (f.name.startsWith(searchPrefix)) {
            candidates.push(f.name + (f.type === 'directory' ? '/' : ''));
          }
        });
      }
    }
    return Array.from(new Set(candidates)).sort();
  };

  const handleTabCompletion = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!input) return;
    const parts = input.split(' ');
    const isCommand = parts.length === 1 && !input.endsWith(' ');
    const partial = isCommand ? parts[0] : parts[parts.length - 1];
    const candidates = getAutocompleteCandidates(partial, isCommand);

    if (candidates.length === 0) return;

    if (candidates.length === 1) {
      const completion = candidates[0];
      let newInput = input;
      if (isCommand) {
        newInput = completion + ' ';
      } else {
        const lastSlash = partial.lastIndexOf('/');
        if (lastSlash !== -1) {
          const dirPart = partial.substring(0, lastSlash + 1);
          newInput = parts.join(' ').slice(0, -(partial.length)) + dirPart + completion;
        } else {
          newInput = parts.join(' ').slice(0, -(partial.length)) + completion;
        }
        // Fix joining logic if needed
        const before = input.lastIndexOf(partial);
        newInput = input.substring(0, before) + completion; // simple replacement
      }
      setInput(newInput);
      setGhostText('');
    } else {
      setHistory(prev => [
        ...prev,
        { command: input, output: candidates, error: false, path: currentPath }
      ]);
    }
  };

  // Ghost text (simple prediction)
  useEffect(() => {
    if (!input) {
      setGhostText('');
      return;
    }
    const parts = input.split(' ');
    const isCommand = parts.length === 1 && !input.endsWith(' ');
    const partial = isCommand ? parts[0] : parts[parts.length - 1];
    const candidates = getAutocompleteCandidates(partial, isCommand);
    if (candidates.length === 1 && candidates[0].startsWith(partial)) {
      setGhostText(candidates[0].substring(partial.length));
    } else {
      setGhostText('');
    }
  }, [input, currentPath]); // Dep on currentPath for file search


  const isCommandValid = (cmd: string): boolean => {
    if (commands[cmd]) return true;
    // Check PATH
    for (const dir of PATH) {
      const p = (dir === '/' ? '' : dir) + '/' + cmd;
      if (getNodeAtPath(p, activeTerminalUser)?.type === 'file') return true;
    }
    return false;
  };

  const executeCommand = async (cmdInput: string) => {
    const trimmed = cmdInput.trim();

    // Add to persistent command history if not empty
    if (trimmed) {
      setCommandHistory(prev => [...prev, trimmed]);
    }

    if (!trimmed) {
      setHistory([...history, { command: '', output: [], path: currentPath }]);
      return;
    }

    // Handle Output Redirection (> and >>)
    let commandStr = trimmed;
    let redirectPath: string | null = null;
    let appendMode = false;

    if (commandStr.includes('>>')) {
      const parts = commandStr.split('>>');
      commandStr = parts[0].trim();
      redirectPath = parts[1]?.trim();
      appendMode = true;
    } else if (commandStr.includes('>')) {
      const parts = commandStr.split('>');
      commandStr = parts[0].trim();
      redirectPath = parts[1]?.trim();
      appendMode = false;
    }

    const parts = commandStr.split(/\s+/);
    const command = parts[0];
    const rawArgs = parts.slice(1);

    const args: string[] = [];
    rawArgs.forEach(arg => {
      args.push(...expandGlob(arg));
    });

    let output: (string | ReactNode)[] = [];
    let error = false;

    const generateOutput = async (): Promise<{ output: (string | ReactNode)[], error: boolean, shouldClear?: boolean }> => {
      let cmdOutput: (string | ReactNode)[] = [];
      let cmdError = false;
      let shouldClear = false;

      // Helper to create a filesystem proxy that acts as a specific user
      const createScopedFileSystem = (asUser: string) => ({
        currentUser, users, groups, homePath,
        resetFileSystem, login, logout,
        resolvePath: contextResolvePath,

        listDirectory: (p: string) => listDirectory(p, asUser),
        getNodeAtPath: (p: string) => getNodeAtPath(p, asUser),
        createFile: (p: string, n: string, c?: string) => createFile(p, n, c, asUser),
        createDirectory: (p: string, n: string) => createDirectory(p, n, asUser),
        moveToTrash: (p: string) => moveToTrash(p, asUser),
        readFile: (p: string) => readFile(p, asUser),
        moveNode: (from: string, to: string) => moveNode(from, to, asUser),
        writeFile: (p: string, c: string) => writeFile(p, c, asUser),
        chmod: (p: string, m: string) => chmod(p, m, asUser),
        chown: (p: string, o: string, g?: string) => chown(p, o, g, asUser),

        as: (user: string) => createScopedFileSystem(user)
      });

      const terminalCommand = getCommand(command);
      if (terminalCommand) {
        const result = await terminalCommand.execute({
          args: args,
          fileSystem: createScopedFileSystem(activeTerminalUser) as any,
          currentPath: currentPath,
          setCurrentPath: setCurrentPath,
          resolvePath: resolvePath,
          allCommands: getAllCommands(),
          terminalUser: activeTerminalUser,
          spawnSession: pushSession,
          closeSession: closeSession
        });

        cmdOutput = result.output;
        cmdError = !!result.error;
        if (result.shouldClear) {
          shouldClear = true;
        }

      } else {
        let foundPath: string | null = null;
        const cmd = command;

        if (cmd.includes('/')) {
          const resolved = resolvePath(cmd);
          const node = getNodeAtPath(resolved);
          if (node && node.type === 'file') foundPath = resolved;
        } else {
          for (const dir of PATH) {
            const checkPath = (dir === '/' ? '' : dir) + '/' + cmd;
            const node = getNodeAtPath(checkPath);
            if (node && node.type === 'file') {
              foundPath = checkPath;
              break;
            }
          }
        }

        if (foundPath) {
          const content = readFile(foundPath);
          if (content && content.startsWith('#!app ')) {
            const appId = content.replace('#!app ', '').trim();
            if (onLaunchApp) {
              onLaunchApp(appId, args);
              cmdOutput = [`Launched ${appId}`];
            } else {
              cmdOutput = [`Cannot launch ${appId}`];
              cmdError = true;
            }
          } else {
            cmdOutput = [`${command}: command not found (binary execution not fully simmed)`];
            cmdError = true;
          }
        } else {
          cmdOutput = [`${command}: command not found`];
          cmdError = true;
        }
      }

      return { output: cmdOutput, error: cmdError, shouldClear };
    };

    const result = await generateOutput();
    output = result.output;
    error = result.error;

    // If clear was requested, reset history and DO NOT append this command to history
    if (result.shouldClear) {
      setHistory([]);
      setInput('');
      setHistoryIndex(-1);
      return;
    }

    if (redirectPath) {
      const textContent = output.filter(o => typeof o === 'string' || typeof o === 'number').join('\n');
      if (redirectPath && textContent) {
        let finalContent = textContent;
        const existing = readFile(redirectPath);
        if (appendMode && existing) {
          finalContent = existing + '\n' + textContent;
        }
        const success = writeFile(redirectPath, finalContent);
        if (!success) {
          output = [`Failed to write to ${redirectPath}`];
          error = true;
        } else {
          output = [];
        }
      }
    }

    setHistory(prev => [
      ...prev,
      {
        command: input,
        output,
        error,
        path: currentPath,
        accentColor: termAccent, // Save current accent
        user: activeTerminalUser // Save current user
      }
    ]);
    setInput('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Navigate persistent command history
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        // commandHistory is ordered old -> new. Reverse logic needed for navigation?
        // Usually Up means "previous command" (newest to oldest).
        // If array is [a, b, c], Up 1 should be c. Up 2 should be b.
        // Index 0 = c? Index 1 = b?
        // Let's treat historyIndex as "distance from end".
        // 0-based index from end: 0 is last command.

        const reverseHistory = [...commandHistory].reverse();
        if (newIndex < reverseHistory.length) {
          setInput(reverseHistory[newIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const reverseHistory = [...commandHistory].reverse();
        if (newIndex < reverseHistory.length) {
          setInput(reverseHistory[newIndex]);
        }
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      handleTabCompletion(e);
    }
  };

  // Determine accent color based on active terminal user
  const getTerminalAccentColor = () => {
    if (activeTerminalUser === 'root') return '#ef4444'; // Red for root
    if (activeTerminalUser === currentUser) return accentColor; // Global accent for current logged in user
    return '#a855f7'; // Purple for other users (e.g. su otheruser)
  };

  const termAccent = getTerminalAccentColor();

  const getPrompt = (path: string = currentPath) => {
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

  const renderInputOverlay = () => {
    const fullText = input;
    const firstSpaceIndex = fullText.indexOf(' ');
    const commandPart = firstSpaceIndex === -1 ? fullText : fullText.substring(0, firstSpaceIndex);
    const restPart = firstSpaceIndex === -1 ? '' : fullText.substring(firstSpaceIndex);
    const isValid = isCommandValid(commandPart);

    return (
      <span className="pointer-events-none whitespace-pre relative z-10">
        <span style={{ color: isValid ? termAccent : '#ef4444' }}>{commandPart}</span>
        <span className="text-white">{restPart}</span>
        <span className="text-white/40">{ghostText}</span>
      </span>
    );
  };

  const content = (
    <div
      className="flex-1 overflow-y-auto p-2 font-mono text-sm space-y-1 scrollbar-hide"
      ref={terminalRef}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="text-gray-400 mb-2">Aurora OS terminal [v{pkg.version}]</div>

      {history.map((item, i) => (
        <div key={i} className="mb-2">
          <div className="flex items-center gap-2" style={{ color: item.accentColor || '#4ade80' }}>
            <span>{item.user || activeTerminalUser}@{`aurora:${item.path.replace(homePath, '~')}$`}</span>
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
      ))}

      <div className="flex relative">
        {getPrompt()}

        <div className="relative flex-1 group">
          <div className="absolute inset-0 top-0 left-0 pointer-events-none select-none whitespace-pre break-all">
            {renderInputOverlay()}
          </div>
          <input
            ref={inputRef}
            type="text"
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
