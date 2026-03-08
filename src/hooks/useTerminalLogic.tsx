import React, { useState, useRef, useEffect, useCallback, ReactNode, useMemo } from "react";
import { validateIntegrity } from "@/utils/integrity";
import { useFileSystem } from "@/components/FileSystemContext";
import { useAppContext } from "@/components/AppContext";
import { checkPermissions } from "@/utils/fileSystemUtils";
import {
  getCommand,
  getAllCommands,
} from "@/utils/terminal/registry";
import { TerminalCommand } from "@/utils/terminal/types";
import { getColorShades } from "@/utils/colors";
import { useI18n } from "@/i18n/index";
import { memory, STORAGE_KEYS } from "@/utils/memory";
import { useWorldContext } from "@/components/WorldContext";
import { useNetworkContext } from "@/components/NetworkContext";

export interface CommandHistory {
  id: string;
  command: string;
  output: (string | ReactNode)[];
  error?: boolean;
  path: string;
  accentColor?: string;
  user?: string;
  hostname?: string;
}

const PATH = ["/bin", "/usr/bin"];

interface CommandStep {
  command: string;
  args: string[];
  redirectOp: string | null;
  redirectPath: string | null;
}

interface Pipeline {
  steps: CommandStep[];
  operator: '&&' | '||' | ';' | null;
}

// 1. Tokenizer: safely splits by special chars while respecting quotes
const tokenize = (input: string): string[] => {
  const tokens: string[] = [];
  let current = '';
  let inQuote: "'" | '"' | null = null;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const next = input[i + 1];

    if (inQuote) {
      if (char === inQuote) {
        inQuote = null;
        current += char; // Keep quotes for arg parsing later
      } else {
        current += char;
      }
    } else {
      if (char === '"' || char === "'") {
        inQuote = char;
        current += char;
      } else if (['|', '&', ';', '>'].includes(char)) {
        // Check for double chars
        const double = char + next;
        if (['&&', '||', '>>'].includes(double)) {
          if (current.trim()) tokens.push(current.trim());
          tokens.push(double);
          current = '';
          i++; // content with skipped char
        } else {
          // Single char
          if (current.trim()) tokens.push(current.trim());
          tokens.push(char);
          current = '';
        }
      } else {
        current += char;
      }
    }
  }
  if (current.trim()) tokens.push(current.trim());
  return tokens;
};

// 2. Parser: Converts tokens into Pipelines
const parseShellInput = (input: string): Pipeline[] => {
  const tokens = tokenize(input);
  const pipelines: Pipeline[] = [];

  let buffer: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (['&&', '||', ';'].includes(t)) {
      if (buffer.length > 0) pipelines.push({ steps: processBufferToSteps(buffer), operator: t as any });
      else if (pipelines.length > 0) pipelines[pipelines.length - 1].operator = t as any;
      buffer = [];
    } else {
      buffer.push(t);
    }
  }
  if (buffer.length > 0) pipelines.push({ steps: processBufferToSteps(buffer), operator: null });

  return pipelines;
};

const processBufferToSteps = (tokens: string[]): CommandStep[] => {
  const steps: CommandStep[] = [];
  let currentCmd: CommandStep = { command: '', args: [], redirectOp: null, redirectPath: null };

  const parseArgs = (str: string) => {
    const args: string[] = [];
    let curr = '';
    let quote: string | null = null;
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (quote) {
        if (c === quote) { quote = null; }
        else { curr += c; }
      } else {
        if (c === '"' || c === "'") { quote = c; }
        else if (/\s/.test(c)) {
          if (curr) { args.push(curr); curr = ''; }
        } else {
          curr += c;
        }
      }
    }
    if (curr) args.push(curr);
    return args;
  };

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === '|') {
      steps.push(currentCmd);
      currentCmd = { command: '', args: [], redirectOp: null, redirectPath: null };
    } else if (t === '>' || t === '>>') {
      currentCmd.redirectOp = t;
      if (i + 1 < tokens.length) {
        const pathToken = tokens[++i];
        currentCmd.redirectPath = pathToken;
      }
    } else {
      const parts = parseArgs(t);
      if (!currentCmd.command && parts.length > 0) {
        currentCmd.command = parts[0];
        currentCmd.args.push(...parts.slice(1));
      } else {
        currentCmd.args.push(...parts);
      }
    }
  }
  if (currentCmd.command) steps.push(currentCmd);
  return steps;
};

export function useTerminalLogic(
  onLaunchApp?: (appId: string, args: string[], owner?: string, remoteComputerId?: string) => void,
  initialUser?: string,
  onClose?: () => void
) {
  const { accentColor } = useAppContext();
  const { t } = useI18n();
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
    writeFile,
    verifyPassword,
  } = useFileSystem();

  // Session Stack for su/sudo (independent of global desktop session)
  // RESOLVED: Using lazy initializer from nightly, but keeping isRootSession logic
  const [sessionStack, setSessionStack] = useState<string[]>(() => {
    if (initialUser) return [initialUser];
    if (currentUser) return [currentUser];
    return [];
  });

  // Interactive Prompting
  const [promptState, setPromptState] = useState<{ message: string; type: 'text' | 'password'; callingHistoryId?: string } | null>(null);
  const promptResolverRef = useRef<((value: string) => void) | null>(null);
  const [isSudoAuthorized, setIsSudoAuthorized] = useState(false);

  // NPC session state — set when player runs `connect <ip>`
  const [connectedTo, setConnectedTo] = useState<string | null>(null);
  const [remoteSessionStack, setRemoteSessionStack] = useState<string[]>([]);
  const worldContext = useWorldContext();
  const networkContext = useNetworkContext();

  const activeTerminalUser = useMemo(() => {
    if (connectedTo) {
      return remoteSessionStack.length > 0
        ? remoteSessionStack[remoteSessionStack.length - 1]
        : 'guest'; // Fallback for remote
    }
    return sessionStack.length > 0
      ? sessionStack[sessionStack.length - 1]
      : currentUser || "guest";
  }, [connectedTo, remoteSessionStack, sessionStack, currentUser]);

  // RESOLVED: Top-Level activeFs Abstraction
  // This object mirrors FileSystemContextType and switches backend based on connection.
  const activeFs = useMemo(() => {
    const createScopedFileSystem = (asUser: string) => ({
      currentUser: asUser,
      users,
      groups,
      homePath,
      resetFileSystem,
      login,
      logout,
      resolvePath: (p: string) => contextResolvePath(p, asUser),
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
      verifyPassword,
      as: (user: string) => createScopedFileSystem(user),
    });

    const localFs = createScopedFileSystem(activeTerminalUser);

    if (connectedTo) {
      const npcApi = worldContext.getNpcApi(connectedTo);
      if (npcApi) return npcApi.as(activeTerminalUser);
    }

    return localFs;
  }, [connectedTo, activeTerminalUser, worldContext, users, groups, homePath, resetFileSystem, login, logout, contextResolvePath, listDirectory, getNodeAtPath, createFile, createDirectory, moveToTrash, readFile, moveNode, writeFile, chmod, chown, verifyPassword]);

  const activeHostname = useMemo(() => {
    try {
      // Use the unified activeFs
      const content = activeFs.readFile("/etc/hostname");
      if (content?.trim()) {
        return content.trim();
      }
    } catch {
      // Fallback if file read fails
    }

    // 3. Fallback logic
    if (connectedTo) {
      const npc = worldContext.resolveNpcTarget(connectedTo);
      return npc?.currentHostname ?? "aurora";
    }

    // Player default: username-machine
    return `${activeTerminalUser}-machine`;
  }, [connectedTo, worldContext, activeFs, activeTerminalUser]);

  // Determine the user scope for persistence
  const historyKey = `${STORAGE_KEYS.TERM_HISTORY_PREFIX}${activeTerminalUser}`;
  const inputKey = `${STORAGE_KEYS.TERM_INPUT_PREFIX}${activeTerminalUser}`;

  // Recursive Deserialization
  const deserializeOutput = (o: any): any => {
    if (o === null || o === undefined) return o;
    if (typeof o === 'string' || typeof o === 'number') return o;
    if (Array.isArray(o)) return o.map(deserializeOutput);

    if (o && typeof o === 'object' && o.__vnode) {
      const { type, props } = o;
      const cleanProps = { ...props };
      if (cleanProps.children) {
        cleanProps.children = deserializeOutput(cleanProps.children);
      }
      return React.createElement(type, cleanProps);
    }
    return o; // Fallback
  };

  // Helper to load history
  const loadHistory = (key: string): CommandHistory[] => {
    try {
      const saved = memory.getItem(key);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return parsed.map((h: any) => ({
        ...h,
        output: h.output.map(deserializeOutput)
      }));
    } catch {
      return [];
    }
  };

  const loadInputHistory = (key: string): string[] => {
    try {
      const saved = memory.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const [history, setHistory] = useState<CommandHistory[]>(() =>
    loadHistory(historyKey)
  );
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>(() =>
    loadInputHistory(inputKey)
  );

  const [historyIndex, setHistoryIndex] = useState(-1);
  const integrityCheckRun = useRef(false);

  // Track previous user to handle switching
  const [prevUser, setPrevUser] = useState(activeTerminalUser);

  // Context Switch: When user changes, save old and load new
  if (prevUser !== activeTerminalUser) {
    setPrevUser(activeTerminalUser);
    setHistory(loadHistory(historyKey));
    setCommandHistory(loadInputHistory(inputKey));
  }

  // Persistence Effects
  useEffect(() => {
    try {
      const serializeOutput = (o: any): any => {
        if (o === null || o === undefined) return o;
        if (typeof o === 'string' || typeof o === 'number') return o;
        if (Array.isArray(o)) return o.map(serializeOutput);

        // Check if it's a React element
        if (o.$$typeof === Symbol.for('react.element') || (o && typeof o === 'object' && o.type && o.props)) {
          const { type, props } = o;

          // Handle fragment or complex types by simplifying to a div if needed, 
          // or just store the string if it's a function component (though ideally we just use primitives in terminal output)
          if (typeof type === 'function' || typeof type === 'symbol') {
            // We can't easily serialize custom components, fallback to strings
            return serializeOutput(props?.children || '[Complex Component]');
          }

          const serializedProps = { ...props };
          if (props.children) {
            serializedProps.children = serializeOutput(props.children);
          }

          return {
            __vnode: true,
            type,
            props: serializedProps
          };
        }

        return "[Complex Output]";
      };

      const safeHistory = history.map((h) => ({
        ...h,
        output: h.output.map(serializeOutput),
      }));
      memory.setItem(historyKey, JSON.stringify(safeHistory));
    } catch (e) {
      console.error("Failed to save terminal history", e);
    }
  }, [history, historyKey]);

  useEffect(() => {
    memory.setItem(inputKey, JSON.stringify(commandHistory));
  }, [commandHistory, inputKey]);

  // Each Terminal instance has its own working directory
  const [currentPath, setCurrentPath] = useState(homePath);

  const pushSession = useCallback((username: string) => {
    setSessionStack((prev) => [...prev, username]);
  }, []);

  // Filter available commands for help/autocompletion
  const getAvailableCommands = useCallback((): TerminalCommand[] => {
    const allCmds = getAllCommands();
    const available: TerminalCommand[] = [];
    const seen = new Set<string>();

    const BUILTINS = ["cd", "exit", "logout", "help", "dev-unlock"];

    // 1. Add built-ins
    BUILTINS.forEach((name) => {
      const cmd = getCommand(name);
      if (cmd) {
        available.push(cmd);
        seen.add(name);
      }
    });

    // 2. Scan PATH for binaries
    for (const dir of PATH) {
      const files = activeFs.listDirectory(dir, activeTerminalUser);
      if (files) {
        files.forEach((f) => {
          if (f.type === "file" && f.content) {
            const match = f.content.match(/#command\s+([a-zA-Z0-9_-]+)/);
            if (match) {
              const cmdName = match[1];
              const cmd = allCmds.find((c) => c.name === cmdName);
              if (cmd && !seen.has(cmdName)) {
                available.push(cmd);
                seen.add(cmdName);
              }
            } else if (f.content.startsWith("#!app ")) {
              const appId = f.content.replace("#!app ", "").trim();
              if (!seen.has(appId)) {
                available.push({
                  name: appId,
                  description: "Application",
                  execute: async (ctx) => {
                    if (ctx.onLaunchApp) {
                      ctx.onLaunchApp(appId, ctx.args, ctx.terminalUser, connectedTo ?? undefined);
                      return {
                        output: [`Launched ${appId} as ${ctx.terminalUser}`],
                      };
                    }
                    return { output: [`Cannot launch ${appId}`], error: true };
                  },
                });
                seen.add(appId);
              }
            }
          }
        });
      }
    }
    return available.sort((a, b) => a.name.localeCompare(b.name));
  }, [activeFs, connectedTo, activeTerminalUser]);

  const closeSession = useCallback(() => {
    setSessionStack((prev) => {
      if (prev.length > 1) return prev.slice(0, -1);
      return prev;
    });
  }, []);



  // Accent Color Logic
  const getTerminalAccentColor = useCallback(() => {
    if (activeTerminalUser === "root") return "#ef4444";
    if (activeTerminalUser === currentUser) return accentColor;
    return "#a855f7";
  }, [activeTerminalUser, currentUser, accentColor]);

  const termAccent = getTerminalAccentColor();
  const shades = getColorShades(termAccent);


  // Optimize Command Lookup: Pre-calculate available commands
  const availableCommands = useMemo(() => {
    const cmds = new Set<string>();

    // 1. Built-ins
    const BUILTINS = ["cd", "exit", "logout", "help", "dev-unlock"];
    BUILTINS.forEach(c => cmds.add(c));

    // 2. Registry Commands
    getAllCommands().forEach(c => cmds.add(c.name));

    // 3. Filesystem Commands (binaries)
    for (const dir of PATH) {
      const files = activeFs.listDirectory(dir, activeTerminalUser);
      if (files) {
        files.forEach(f => {
          if (f.type === 'file') {
            if (f.name) cmds.add(f.name);
            if (f.content?.startsWith("#!app ")) {
              cmds.add(f.content.replace("#!app ", "").trim());
            }
          }
        });
      }
    }

    return cmds;
  }, [activeFs, activeTerminalUser]);

  // Autocomplete
  const getAutocompleteCandidates = useCallback(
    (partial: string, isCommand: boolean): string[] => {
      const candidates: string[] = [];
      if (isCommand) {
        candidates.push(...Array.from(availableCommands).filter(c => c.startsWith(partial)));
      } else {
        let searchDir = currentPath;
        let searchPrefix = partial;
        const lastSlash = partial.lastIndexOf("/");
        if (lastSlash !== -1) {
          const dirPart =
            lastSlash === 0 ? "/" : partial.substring(0, lastSlash);
          searchPrefix = partial.substring(lastSlash + 1);
          searchDir = activeFs.resolvePath(dirPart, activeTerminalUser);
        }
        const files = activeFs.listDirectory(searchDir, activeTerminalUser);
        if (files) {
          files.forEach((f) => {
            if (f.name.startsWith(searchPrefix)) {
              candidates.push(f.name + (f.type === "directory" ? "/" : ""));
            }
          });
        }
      }
      return Array.from(new Set(candidates)).sort();
    },
    [activeFs, currentPath, availableCommands, activeTerminalUser]
  );

  // Ghost Text
  const ghostText = useMemo(() => {
    if (!input) return "";

    const parts = input.split(" ");
    const isCommand = parts.length === 1 && !input.endsWith(" ");
    const partial = isCommand ? parts[0] : parts[parts.length - 1];

    const candidates = getAutocompleteCandidates(partial, isCommand);
    if (candidates.length === 1 && candidates[0].startsWith(partial)) {
      return candidates[0].substring(partial.length);
    }
    return "";
  }, [input, getAutocompleteCandidates]);

  const handleTabCompletion = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!input) return;
    const parts = input.split(" ");
    const isCommand = parts.length === 1 && !input.endsWith(" ");
    const partial = isCommand ? parts[0] : parts[parts.length - 1];
    const candidates = getAutocompleteCandidates(partial, isCommand);

    if (candidates.length === 0) return;

    if (candidates.length === 1) {
      let completion = candidates[0];
      if (
        completion.includes(" ") &&
        !completion.startsWith('"') &&
        !completion.startsWith("'")
      ) {
        completion = `"${completion}"`;
      }

      let newInput: string;
      if (isCommand) {
        newInput = completion + " ";
      } else {
        const lastSlash = partial.lastIndexOf("/");
        if (lastSlash !== -1) {
          const dirPart = partial.substring(0, lastSlash + 1);
          newInput =
            parts.join(" ").slice(0, -partial.length) + dirPart + completion;
        } else {
          newInput = parts.join(" ").slice(0, -partial.length) + completion;
        }
      }
      setInput(newInput);
    } else {
      setHistory((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          command: input,
          output: candidates,
          error: false,
          path: currentPath,
          user: activeTerminalUser,
          hostname: activeHostname,
          accentColor: termAccent,
        },
      ]);
    }
  };

  const isCommandValid = useCallback((cmd: string): boolean => {
    return availableCommands.has(cmd);
  }, [availableCommands]);

  const prompt = useCallback(
    (
      message: string,
      type: "text" | "password" = "text",
      callingHistoryId?: string
    ): Promise<string> => {
      setPromptState({ message, type, callingHistoryId });
      return new Promise((resolve) => {
        promptResolverRef.current = resolve;
      });
    },
    []
  );

  const getCommandHistoryFn = useCallback(() => {
    return commandHistory;
  }, [commandHistory]);

  const clearCommandHistoryFn = useCallback(() => {
    setCommandHistory([]);
  }, []);

  /* * CORE EXECUTION ENGINE
   */
  const executeCommand = async (cmdInput: string) => {
    if (promptState && promptResolverRef.current) {
      const resolver = promptResolverRef.current;
      promptResolverRef.current = null;
      const { message, type, callingHistoryId } = promptState;
      setPromptState(null);

      if (callingHistoryId) {
        setHistory((prev) => {
          const newHistory = [...prev];
          const idx = newHistory.findIndex((h) => h.id === callingHistoryId);
          if (idx !== -1) {
            const displayInput = type === "password" ? "********" : cmdInput;
            newHistory[idx] = {
              ...newHistory[idx],
              output: [...newHistory[idx].output, `${message} ${displayInput}`],
            };
          }
          return newHistory;
        });
      }
      resolver(cmdInput);
      setInput("");
      return;
    }

    const trimmed = cmdInput.trim();
    if (trimmed) setCommandHistory((prev) => [...prev, trimmed]);
    if (!trimmed) {
      setHistory([...history, { id: crypto.randomUUID(), command: "", output: [], path: currentPath }]);
      return;
    }

    const historyId = crypto.randomUUID();
    setHistory((prev) => [
      ...prev,
      {
        id: historyId,
        command: trimmed,
        output: [],
        path: currentPath,
        accentColor: termAccent,
        user: activeTerminalUser,
        hostname: activeHostname,
      },
    ]);
    setInput("");
    setHistoryIndex(-1);

    // Variable Expansion
    const interactiveEnv: Record<string, string> = {
      USER: activeTerminalUser,
      HOME: homePath,
      PWD: currentPath,
      TERM: "xterm-256color",
    };
    const expandedInput = trimmed.replace(/\$([a-zA-Z0-9_]+)/g, (_, key) => {
      return interactiveEnv[key] !== undefined ? interactiveEnv[key] : "";
    });

    const pipelines = parseShellInput(expandedInput);

    // Pipeline Loop Execution State
    let loopCurrentPath = currentPath;
    let loopConnectedTo = connectedTo;
    let loopSessionStack = [...sessionStack];
    let loopRemoteSessionStack = [...remoteSessionStack];

    const getLoopActiveUser = () => {
      if (loopConnectedTo) {
        return loopRemoteSessionStack.length > 0
          ? loopRemoteSessionStack[loopRemoteSessionStack.length - 1]
          : 'guest';
      }
      return loopSessionStack.length > 0
        ? loopSessionStack[loopSessionStack.length - 1]
        : currentUser || "guest";
    };

    const getLoopActiveFs = () => {
      const activeUser = getLoopActiveUser();
      const createScopedFileSystem = (asUser: string) => ({
        currentUser: asUser,
        users,
        groups,
        homePath,
        resetFileSystem,
        login,
        logout,
        resolvePath: (p: string) => contextResolvePath(p, asUser),
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
        verifyPassword,
        as: (user: string) => createScopedFileSystem(user),
      });

      const localFs = createScopedFileSystem(activeUser);

      if (loopConnectedTo) {
        const npcApi = worldContext.getNpcApi(loopConnectedTo);
        if (npcApi) return npcApi.as(activeUser);
      }

      return localFs;
    };

    // Provide a fully robust resolvePath for the loop that evaluates
    // the dynamic current path BEFORE asking the active FS to resolve it.
    const resolvePathLoop = (p: string): string => {
      let resolved = p;
      if (!resolved.startsWith("/") && !resolved.startsWith("~")) {
        resolved = loopCurrentPath + (loopCurrentPath === "/" ? "" : "/") + resolved;
      }
      return getLoopActiveFs().resolvePath(resolved, getLoopActiveUser());
    };

    const expandGlobLoop = (pattern: string): string[] => {
      if (!pattern.includes("*")) return [pattern];
      const resolvedPath = resolvePathLoop(loopCurrentPath);
      if (pattern.includes("/")) return [pattern];
      const fs = getLoopActiveFs();
      const files = fs.listDirectory(resolvedPath, getLoopActiveUser());
      if (!files) return [pattern];

      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp("^" + escapedPattern.replace(/\\\*/g, ".*") + "$");
      const matches = files
        .filter((f) => regex.test(f.name))
        .map((f) => f.name);

      return matches.length > 0 ? matches : [pattern];
    };

    let lastExitCode = 0;
    const overallOutput: (string | ReactNode)[] = [];
    let shouldClearScreen = false;

    const appendOutput = (content: string | ReactNode | (string | ReactNode)[]) => {
      setHistory((prev) => {
        const newHistory = [...prev];
        const idx = newHistory.findIndex((h) => h.id === historyId);
        const newLines = Array.isArray(content) ? content : [content];

        if (idx !== -1) {
          newHistory[idx] = {
            ...newHistory[idx],
            output: [...newHistory[idx].output, ...newLines],
            error: lastExitCode !== 0
          };
        } else {
          // Cross-session pipeline boundary: the active user changed mid-pipeline,
          // so the new user's history array doesn't have the original command row!
          newHistory.push({
            id: historyId,
            command: trimmed,
            output: newLines,
            error: lastExitCode !== 0,
            path: loopCurrentPath,
            accentColor: termAccent,
            user: getLoopActiveUser(),
            hostname: loopConnectedTo ? worldContext.resolveNpcTarget(loopConnectedTo)?.currentHostname : activeHostname,
          });
        }
        return newHistory;
      });
    };

    // Internal function to run a single command step
    const runStep = async (step: CommandStep, stdinData?: string[]): Promise<{ output: (string | ReactNode)[], error: boolean, exitCode: number, newCwd?: string }> => {
      const { command, redirectOp, redirectPath } = step;

      const loopActiveFs = getLoopActiveFs();
      const loopActiveUser = getLoopActiveUser();

      const args: string[] = [];
      step.args.forEach((arg) => {
        if (arg.includes("*")) {
          // RESOLVED: expandGlob using loop activeFs
          args.push(...expandGlobLoop(arg));
        } else {
          args.push(arg);
        }
      });

      let cmdToRun: TerminalCommand | undefined = undefined;
      let isAppLaunch = false;
      let launchAppId = '';

      let binPath: string | null = null;

      if (command.includes('/')) {
        const resolved = loopActiveFs.resolvePath(command);
        const node = loopActiveFs.getNodeAtPath(resolved);
        if (node && node.type === 'file') {
          const actingUserObj = loopActiveFs.users.find(u => u.username === loopActiveUser);
          if (actingUserObj && checkPermissions(node, actingUserObj, 'execute')) {
            binPath = resolved;
          } else {
            return { output: [`zsh: permission denied: ${command}`], error: true, exitCode: 126 };
          }
        }
      } else {
        for (const dir of PATH) {
          const check = (dir === '/' ? '' : dir) + '/' + command;
          const node = loopActiveFs.getNodeAtPath(check);
          if (node && node.type === 'file') {
            const actingUserObj = loopActiveFs.users.find(u => u.username === loopActiveUser);
            if (actingUserObj && checkPermissions(node, actingUserObj, 'execute')) {
              binPath = check;
              break;
            }
          }
        }
      }

      if (binPath) {
        const content = loopActiveFs.readFile(binPath);
        if (content) {
          if (content.startsWith('#!app ')) {
            isAppLaunch = true;
            launchAppId = content.replace('#!app ', '').trim();
          } else {
            const match = content.match(/#command\s+([a-zA-Z0-9_-]+)/);
            if (match) cmdToRun = getCommand(match[1]);
          }
        }
      }

      if (isAppLaunch) {
        if (onLaunchApp) {
          onLaunchApp(launchAppId, args, loopActiveUser, loopConnectedTo ?? undefined);
          return { output: [`Launched ${launchAppId} as ${loopActiveUser}`], error: false, exitCode: 0 };
        }
        return { output: [`Cannot launch ${launchAppId}`], error: true, exitCode: 1 };
      }

      if (cmdToRun) {
        const spawnSession = (username: string) => {
          if (loopConnectedTo) {
            loopRemoteSessionStack.push(username);
            setRemoteSessionStack([...loopRemoteSessionStack]);
          } else {
            loopSessionStack.push(username);
            pushSession(username);
          }
        };

        const closeSessionContext = () => {
          if (loopConnectedTo) {
            if (loopRemoteSessionStack.length > 1) loopRemoteSessionStack.pop();
            setRemoteSessionStack([...loopRemoteSessionStack]);
          } else {
            if (loopSessionStack.length > 1) loopSessionStack.pop();
            closeSession();
          }
        };

        const result = await cmdToRun.execute({
          args,
          stdin: stdinData,
          fileSystem: loopActiveFs as any,
          currentPath: loopCurrentPath,
          setCurrentPath: (p) => {
            loopCurrentPath = p;
            setCurrentPath(p);
          },
          resolvePath: (p) => resolvePathLoop(p),
          allCommands: getAvailableCommands(),
          terminalUser: loopActiveUser,
          spawnSession: spawnSession,
          closeSession: closeSessionContext,
          onLaunchApp,
          getNodeAtPath: (p, u) => loopActiveFs.getNodeAtPath(p, u),
          readFile: (p, u) => loopActiveFs.readFile(p, u),
          prompt: (m, t) => prompt(m, t, historyId),
          print: appendOutput,
          isSudoAuthorized,
          setIsSudoAuthorized,
          verifyPassword: (u, p) => loopActiveFs.verifyPassword(u, p),
          t,
          getCommandHistory: getCommandHistoryFn,
          clearCommandHistory: clearCommandHistoryFn,
          closeWindow: onClose,
          isRootSession: loopConnectedTo ? loopRemoteSessionStack.length <= 1 : loopSessionStack.length <= 1,
          connectedTo: loopConnectedTo,
          connect: (ip: string) => {
            if (!networkContext.wifiEnabled || !networkContext.currentNetwork) {
              appendOutput([`connect: network is unreachable`]);
              return;
            }
            const target = worldContext.resolveNpcTarget(ip);
            if (!target) {
              appendOutput([`connect: ${ip}: Host not found or not reachable`]);
              return;
            }
            loopConnectedTo = target.currentIP;
            setConnectedTo(target.currentIP);
            const npcUser = target.users.find(u => u.uid === 1000)?.username ?? 'guest';
            loopRemoteSessionStack = [npcUser];
            setRemoteSessionStack([npcUser]);
            appendOutput([`Connected to ${target.currentHostname} (${target.currentIP}) as ${npcUser}`]);
            loopCurrentPath = `/home/${npcUser}`;
            setCurrentPath(`/home/${npcUser}`);
          },
          disconnect: () => {
            if (loopConnectedTo) {
              const target = worldContext.resolveNpcTarget(loopConnectedTo);
              appendOutput([`Connection to ${target?.currentHostname ?? loopConnectedTo} closed.`]);
            }
            loopConnectedTo = null;
            setConnectedTo(null);
            loopRemoteSessionStack = [];
            setRemoteSessionStack([]);
            // Reset CWD back to local home
            loopCurrentPath = homePath;
            setCurrentPath(homePath);
          },
        });

        if (result.shouldClear) shouldClearScreen = true;

        // Handle Redirection (if any)
        if (redirectOp && redirectPath) {
          const fullOutputPath = loopActiveFs.resolvePath(redirectPath);
          const outputString = result.output.map(o => typeof o === 'string' ? o : '[React Component]').join('\n');

          if (redirectOp === '>') {
            loopActiveFs.writeFile(fullOutputPath, outputString);
          } else if (redirectOp === '>>') {
            const existing = loopActiveFs.readFile(fullOutputPath) || '';
            loopActiveFs.writeFile(fullOutputPath, existing + (existing ? '\n' : '') + outputString);
          }
          return { output: [], error: result.error ?? false, exitCode: result.error ? 1 : 0, newCwd: result.newCwd };
        }

        return {
          output: result.output,
          error: !!result.error,
          exitCode: result.error ? 1 : 0,
          newCwd: result.newCwd
        };
      }

      return { output: [`${command}: command not found`], error: true, exitCode: 127 };
    };

    try {
      // Iterate Pipelines
      for (const pipeline of pipelines) {
        let pipeInput: string[] | undefined = undefined;

        for (let i = 0; i < pipeline.steps.length; i++) {
          const step = pipeline.steps[i];
          const result = await runStep(step, pipeInput);

          if (i < pipeline.steps.length - 1) {
            pipeInput = result.output
              .map(o => typeof o === 'string' ? o : '')
              .filter(s => s !== '');
          } else {
            overallOutput.push(...result.output);
            if (result.output.length > 0) {
              appendOutput(result.output);
            }
          }

          lastExitCode = result.exitCode;

          if (result.newCwd) {
            loopCurrentPath = result.newCwd;
            setCurrentPath(result.newCwd);
            interactiveEnv['PWD'] = result.newCwd;
          }
        }

        if (pipeline.operator === '&&' && lastExitCode !== 0) {
          break;
        }
        if (pipeline.operator === '||' && lastExitCode === 0) break;
      }
    } catch (err: any) {
      console.error("[TerminalExecutionEngine] FATAL CRASH:", err);
    }

    if (shouldClearScreen) {
      setHistory([]);
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey) {
      switch (e.key) {
        case "l":
          e.preventDefault();
          setHistory([]);
          return;
        case "c":
          e.preventDefault();
          setInput("");
          setHistory((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              command: input + "^C",
              output: [],
              error: false,
              path: currentPath,
              user: activeTerminalUser,
              hostname: activeHostname,
              accentColor: termAccent,
            },
          ]);
          return;
        case "u":
          e.preventDefault();
          setInput("");
          return;
      }
    }

    if (e.key === "Enter") {
      executeCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        const cmd = commandHistory[commandHistory.length - 1 - newIndex];
        if (cmd) setInput(cmd);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const cmd = commandHistory[commandHistory.length - 1 - newIndex];
        if (cmd) setInput(cmd);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (e.key === "Tab") {
      handleTabCompletion(e);
    }
  };

  // Integrity Check Side Effect
  useEffect(() => {
    if (integrityCheckRun.current) return;
    const timer = setTimeout(() => {
      if (!validateIntegrity()) {
        integrityCheckRun.current = true;
        setHistory((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            command: "",
            output: [
              <div
                className="text-red-500 font-bold bg-red-950/30 p-2 border border-red-500/50 rounded mb-2"
                key="integrity-error"
              >
                CRITICAL ERROR: SYSTEM INTEGRITY COMPROMISED <br />
                The system has detected unauthorized modifications to core
                identity files.
                <br />
                Entering Safe Mode: Write access disabled.Root access disabled.
              </div>,
            ],
            path: currentPath || "~",
            user: activeTerminalUser,
            accentColor: "#ef4444",
          },
        ]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [activeTerminalUser, currentPath]);

  return {
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
    promptState,
    clearHistory: () => setHistory([]),
    isSudoAuthorized,
    setIsSudoAuthorized,
    connectedTo,
    activeHostname,
  };
}