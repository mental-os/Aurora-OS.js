import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { validateIntegrity } from '../utils/integrity';
import { useFileSystem } from '../components/FileSystemContext';
import { useAppContext } from '../components/AppContext';
import { checkPermissions } from '../utils/fileSystemUtils';
import { getCommand, commands, getAllCommands } from '../utils/terminal/registry';
import { TerminalCommand } from '../utils/terminal/types';
import { getColorShades } from '../utils/colors';

export interface CommandHistory {
    id: string;
    command: string;
    output: (string | ReactNode)[];
    error?: boolean;
    path: string;
    accentColor?: string;
    user?: string;
}

const PATH = ['/bin', '/usr/bin'];

// Helper to safely parse command input respecting quotes and concatenation
const parseCommandInput = (input: string): { command: string; args: string[]; redirectOp: string | null; redirectPath: string | null } => {
    const tokens: string[] = [];
    let currentToken = '';
    let inQuote: "'" | '"' | null = null;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        if (inQuote) {
            if (char === inQuote) {
                inQuote = null;
            } else {
                currentToken += char;
            }
        } else {
            if (char === '"' || char === "'") {
                inQuote = char;
            } else if (/\s/.test(char)) {
                if (currentToken.length > 0) {
                    tokens.push(currentToken);
                    currentToken = '';
                }
            } else {
                currentToken += char;
            }
        }
    }

    if (currentToken.length > 0) {
        tokens.push(currentToken);
    }

    if (tokens.length === 0) return { command: '', args: [], redirectOp: null, redirectPath: null };

    // Scan for redirection
    let redirectIndex = -1;
    let redirectOp: string | null = null;

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '>' || tokens[i] === '>>') {
            redirectIndex = i;
            redirectOp = tokens[i];
            break;
        }
    }

    if (redirectIndex !== -1) {
        const commandParts = tokens.slice(0, redirectIndex);
        const pathPart = tokens[redirectIndex + 1] || null;
        return {
            command: commandParts[0] || '',
            args: commandParts.slice(1),
            redirectOp,
            redirectPath: pathPart
        };
    }

    return {
        command: tokens[0],
        args: tokens.slice(1),
        redirectOp: null,
        redirectPath: null
    };
};

export function useTerminalLogic(onLaunchApp?: (appId: string, args: string[], owner?: string) => void, initialUser?: string) {
    const { accentColor } = useAppContext();
    const [history, setHistory] = useState<CommandHistory[]>([]);
    const [input, setInput] = useState('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [ghostText, setGhostText] = useState('');
    const integrityCheckRun = useRef(false);

    // Session Stack for su/sudo (independent of global desktop session)
    const [sessionStack, setSessionStack] = useState<string[]>([]);

    // Interactive Prompting
    const [promptState, setPromptState] = useState<{ message: string; type: 'text' | 'password'; callingHistoryId?: string } | null>(null);
    const promptResolverRef = useRef<((value: string) => void) | null>(null);
    const [isSudoAuthorized, setIsSudoAuthorized] = useState(false);

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
        verifyPassword
    } = useFileSystem();

    // Initialize session with current global user or specific initial owner
    useEffect(() => {
        if (sessionStack.length === 0) {
            if (initialUser) {
                setSessionStack([initialUser]);
            } else if (currentUser) {
                setSessionStack([currentUser]);
            }
        }
    }, [currentUser, sessionStack.length, initialUser]);

    const activeTerminalUser = sessionStack.length > 0 ? sessionStack[sessionStack.length - 1] : (currentUser || 'guest');

    // Each Terminal instance has its own working directory
    const [currentPath, setCurrentPath] = useState(homePath);

    const pushSession = useCallback((username: string) => {
        setSessionStack(prev => [...prev, username]);
    }, []);

    // Filter available commands for help/autocompletion (Defined early for usage in execute)
    const getAvailableCommands = useCallback((): TerminalCommand[] => {
        const allCmds = getAllCommands();
        const available: TerminalCommand[] = [];
        const seen = new Set<string>();

        const BUILTINS = ['cd', 'exit', 'logout', 'help', 'dev-unlock']; // Ensure BUILTINS is available or move it here

        // 1. Add built-ins
        BUILTINS.forEach(name => {
            const cmd = getCommand(name);
            if (cmd) {
                available.push(cmd);
                seen.add(name);
            }
        });

        // 2. Scan PATH for binaries
        for (const dir of PATH) {
            const files = listDirectory(dir, activeTerminalUser);
            if (files) {
                files.forEach(f => {
                    if (f.type === 'file' && f.content) {
                        // If it's a mapped command
                        const match = f.content.match(/#command\s+([a-zA-Z0-9_-]+)/);
                        if (match) {
                            const cmdName = match[1];
                            const cmd = allCmds.find(c => c.name === cmdName);
                            if (cmd && !seen.has(cmdName)) {
                                available.push(cmd);
                                seen.add(cmdName);
                            }
                        } else if (f.content.startsWith('#!app ')) {
                            // It's an app - create a functional command entry
                            const appId = f.content.replace('#!app ', '').trim();
                            if (!seen.has(appId)) {
                                available.push({
                                    name: appId,
                                    description: 'Application',
                                    execute: async (ctx) => {
                                        if (ctx.onLaunchApp) {
                                            ctx.onLaunchApp(appId, ctx.args, ctx.terminalUser);
                                            return { output: [`Launched ${appId} as ${ctx.terminalUser}`] };
                                        }
                                        return { output: [`Cannot launch ${appId}`], error: true };
                                    }
                                });
                                seen.add(appId);
                            }
                        }
                    }
                });
            }
        }
        return available.sort((a, b) => a.name.localeCompare(b.name));
    }, [activeTerminalUser, listDirectory]);

    const closeSession = useCallback(() => {
        setSessionStack(prev => {
            if (prev.length > 1) return prev.slice(0, -1);
            return prev;
        });
    }, []);

    // Local path resolution
    const resolvePath = useCallback((path: string): string => {
        let resolved = path;
        if (!path.startsWith('/') && !path.startsWith('~')) {
            resolved = currentPath + (currentPath === '/' ? '' : '/') + path;
        }
        return contextResolvePath(resolved, activeTerminalUser);
    }, [currentPath, contextResolvePath, activeTerminalUser]);

    // Accent Color Logic
    const getTerminalAccentColor = useCallback(() => {
        if (activeTerminalUser === 'root') return '#ef4444';
        if (activeTerminalUser === currentUser) return accentColor;
        return '#a855f7';
    }, [activeTerminalUser, currentUser, accentColor]);

    const termAccent = getTerminalAccentColor();
    const shades = getColorShades(termAccent);

    // Glob expansion
    const expandGlob = useCallback((pattern: string): string[] => {
        if (!pattern.includes('*')) return [pattern];
        const resolvedPath = resolvePath(currentPath);
        if (pattern.includes('/')) return [pattern];
        const files = listDirectory(resolvedPath, activeTerminalUser);
        if (!files) return [pattern];

        const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp('^' + escapedPattern.replace(/\\\*/g, '.*') + '$');
        const matches = files
            .filter(f => regex.test(f.name))
            .map(f => f.name);

        return matches.length > 0 ? matches : [pattern];
    }, [currentPath, resolvePath, listDirectory, activeTerminalUser]);

    // Autocomplete
    const getAutocompleteCandidates = useCallback((partial: string, isCommand: boolean): string[] => {
        const candidates: string[] = [];
        if (isCommand) {
            // 1. Built-ins
            const BUILTINS = ['cd', 'exit', 'logout', 'help', 'dev-unlock'];
            candidates.push(...BUILTINS.filter(c => c.startsWith(partial)));

            // 2. Filesystem commands

            for (const pathDir of PATH) {
                const files = listDirectory(pathDir, activeTerminalUser);
                if (files) {
                    files.forEach(f => {
                        if (f.name.startsWith(partial) && f.type === 'file') {
                            candidates.push(f.name);
                        } else if (f.type === 'file' && f.content && f.content.startsWith('#!app ')) {
                            // Also check app IDs if they match partial, even if filename differs (though typically they are same)
                            const appId = f.content.replace('#!app ', '').trim();
                            if (appId.startsWith(partial)) candidates.push(appId);
                        }
                    });
                }
            }
        } else {
            let searchDir = currentPath;
            let searchPrefix = partial;
            const lastSlash = partial.lastIndexOf('/');
            if (lastSlash !== -1) {
                const dirPart = lastSlash === 0 ? '/' : partial.substring(0, lastSlash);
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
    }, [activeTerminalUser, currentPath, listDirectory, resolvePath]);

    // Ghost Text Effect
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
    }, [input, currentPath, getAutocompleteCandidates]);

    const handleTabCompletion = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (!input) return;
        const parts = input.split(' ');
        const isCommand = parts.length === 1 && !input.endsWith(' ');
        const partial = isCommand ? parts[0] : parts[parts.length - 1];
        const candidates = getAutocompleteCandidates(partial, isCommand);

        if (candidates.length === 0) return;

        if (candidates.length === 1) {
            let completion = candidates[0];
            // Auto-quote if contains spaces
            if (completion.includes(' ') && !completion.startsWith('"') && !completion.startsWith("'")) {
                completion = `"${completion}"`;
            }

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
            }
            setInput(newInput);
            setGhostText('');
        } else {
            setHistory(prev => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    command: input,
                    output: candidates,
                    error: false,
                    path: currentPath,
                    user: activeTerminalUser,
                    accentColor: termAccent
                }
            ]);
        }
    };

    const isCommandValid = (cmd: string): boolean => {
        if (commands[cmd]) return true;
        for (const dir of PATH) {
            const p = (dir === '/' ? '' : dir) + '/' + cmd;
            if (getNodeAtPath(p, activeTerminalUser)?.type === 'file') return true;
        }
        return false;
    };

    const prompt = useCallback((message: string, type: 'text' | 'password' = 'text', callingHistoryId?: string): Promise<string> => {
        setPromptState({ message, type, callingHistoryId });
        return new Promise((resolve) => {
            promptResolverRef.current = resolve;
        });
    }, []);

    const executeCommand = async (cmdInput: string) => {
        if (promptState && promptResolverRef.current) {
            const resolver = promptResolverRef.current;
            promptResolverRef.current = null;
            const { message, type, callingHistoryId } = promptState;
            setPromptState(null);

            // Append prompt result to the calling history item if it exists
            if (callingHistoryId) {
                setHistory(prev => {
                    const newHistory = [...prev];
                    const idx = newHistory.findIndex(h => h.id === callingHistoryId);
                    if (idx !== -1) {
                        const displayInput = type === 'password' ? '********' : cmdInput;
                        newHistory[idx] = {
                            ...newHistory[idx],
                            output: [...newHistory[idx].output, `${message} ${displayInput}`]
                        };
                    }
                    return newHistory;
                });
            } else {
                // Fallback: Add as a new item if no calling ID (unlikely)
                setHistory(prev => [
                    ...prev,
                    {
                        id: crypto.randomUUID(),
                        command: type === 'password' ? '********' : cmdInput,
                        output: [],
                        path: currentPath,
                        user: message,
                        accentColor: termAccent
                    }
                ]);
            }

            resolver(cmdInput);
            setInput('');
            return;
        }

        const trimmed = cmdInput.trim();

        if (trimmed) {
            setCommandHistory(prev => [...prev, trimmed]);
        }

        if (!trimmed) {
            setHistory([...history, { id: crypto.randomUUID(), command: '', output: [], path: currentPath }]);
            return;
        }

        const historyId = crypto.randomUUID();
        setHistory(prev => [
            ...prev,
            {
                id: historyId,
                command: trimmed,
                output: [],
                path: currentPath,
                accentColor: termAccent,
                user: activeTerminalUser
            }
        ]);
        setInput('');
        setHistoryIndex(-1);


        // Variable Expansion (Interactive)
        // Mimic the script engine's expansion for consistency
        const interactiveEnv: Record<string, string> = {
            USER: activeTerminalUser,
            HOME: homePath,
            PWD: currentPath,
            TERM: 'xterm-256color'
        };

        // Naive expansion that respects basic quoting is hard without a full parser.
        // For now, we'll use a simple regex but try to avoid touching '$VAR' if possible? 
        // Actually, the script engine uses naive replacement. We should match that for now.
        // If the user wants to escape, they can use backslash which we don't fully handle yet everywhere.
        const expandedInput = trimmed.replace(/\$([a-zA-Z0-9_]+)/g, (_, key) => {
            return interactiveEnv[key] !== undefined ? interactiveEnv[key] : '';
        });

        const { command, args: rawArgs, redirectOp, redirectPath } = parseCommandInput(expandedInput);
        const args: string[] = [];
        rawArgs.forEach(arg => {
            if (arg.includes('*')) {
                args.push(...expandGlob(arg));
            } else {
                args.push(arg);
            }
        });

        let output: (string | ReactNode)[] = [];
        let error = false;

        const generateOutput = async (): Promise<{ output: (string | ReactNode)[], error: boolean, shouldClear?: boolean }> => {
            let cmdOutput: (string | ReactNode)[] = [];
            let cmdError = false;
            let shouldClear = false;

            const createScopedFileSystem = (asUser: string) => ({
                currentUser: asUser,
                users, groups, homePath,
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

            // Shell built-ins that don't depend on filesystem
            const BUILTINS = ['cd', 'exit', 'logout', 'help', 'dev-unlock'];
            let targetCommandName = '';
            let isAppLaunch = false;
            let launchAppId = '';

            if (BUILTINS.includes(command)) {
                targetCommandName = command;
            } else {
                // Search filesystem for binary
                let foundPath: string | null = null;
                let foundContent: string | null = null;

                if (command.includes('/')) {
                    const resolved = resolvePath(command);
                    const node = getNodeAtPath(resolved, activeTerminalUser);
                    // In a real OS we'd check execute permissions here
                    if (node && node.type === 'file') {
                        // Strict Execution Bit Check
                        const actingUserObj = users.find(u => u.username === activeTerminalUser);
                        if (actingUserObj && checkPermissions(node, actingUserObj, 'execute')) {
                            foundPath = resolved;
                            foundContent = readFile(resolved, activeTerminalUser);
                        } else {
                            // Found but permission denied
                            cmdOutput = [`${command}: Permission denied`];
                            cmdError = true;
                            // Return early or flag? If we don't set foundPath, it falls through to "command not found" 
                            // which is wrong. We should handle this.
                            // But wait, the loop below might find another binary in PATH?
                            // Standard shell behavior: if found in PATH but not executable, keep searching? 
                            // Actually bash stops and says permission denied if it's the specific path provided.
                            // If it's a search in PATH, it might skip?
                            // For explicit path (contains /): fail immediately.
                            return { output: [`${command}: Permission denied`], error: true };
                        }
                    }
                } else {
                    for (const dir of PATH) {
                        const checkPath = (dir === '/' ? '' : dir) + '/' + command;
                        const node = getNodeAtPath(checkPath, activeTerminalUser);
                        if (node && node.type === 'file') {
                            // PATH Search: Check permissions
                            const actingUserObj = users.find(u => u.username === activeTerminalUser);
                            if (actingUserObj && checkPermissions(node, actingUserObj, 'execute')) {
                                foundPath = checkPath;
                                foundContent = readFile(checkPath, activeTerminalUser);
                                break;
                            } else {
                                // Found binary but not executable.
                                // In bash, if we find a match but can't execute, we might continue searching PATH?
                                // Or we stop and say permission denied?
                                // "If the name is found but is not an executable utility, the search shall continue."
                                // So we continue.
                            }
                        }
                    }
                }

                if (foundPath && foundContent) {
                    if (foundContent.startsWith('#!app ')) {
                        isAppLaunch = true;
                        launchAppId = foundContent.replace('#!app ', '').trim();
                    } else {
                        // Check for mapped command
                        const match = foundContent.match(/#command\s+([a-zA-Z0-9_-]+)/);
                        if (match) {
                            targetCommandName = match[1];
                        } else {
                            // Shell Script Execution Support (Enhanced)
                            // Features:
                            // 1. Variable expansion ($VAR) and assignment (VAR=val)
                            // 2. Directory persistence (cd works) in subshell scope

                            const lines = foundContent.split('\n');
                            const scriptOutput: ReactNode[] = [];
                            let scriptError = false;

                            // State for the script execution context
                            let localCurrentPath = currentPath;
                            const env: Record<string, string> = {
                                USER: activeTerminalUser,
                                HOME: homePath,
                                PATH: PATH.join(':'),
                                PWD: localCurrentPath,
                                TERM: 'xterm-256color'
                            };

                            // Helper: Expand variables in a string
                            const expandVariables = (str: string) => {
                                return str.replace(/\$([a-zA-Z0-9_]+)/g, (_, key) => env[key] || '');
                            };

                            // Helper: Resolve path using LOCAL current path
                            const resolveLocalPath = (path: string) => {
                                if (path.startsWith('/')) return path;
                                if (path.startsWith('~')) return path.replace('~', homePath);
                                // Simple relative path resolution
                                if (path === '..') {
                                    const parts = localCurrentPath.split('/');
                                    parts.pop();
                                    return parts.join('/') || '/';
                                }
                                if (path === '.') return localCurrentPath;

                                return localCurrentPath === '/'
                                    ? `/${path}`
                                    : `${localCurrentPath === '/' ? '' : localCurrentPath}/${path}`;
                            };

                            const availableCmds = getAvailableCommands();

                            for (const rawLine of lines) {
                                let line = rawLine.trim();
                                if (!line || line.startsWith('#')) continue;

                                // 1. Variable Expansion
                                line = expandVariables(line);

                                // 2. Variable Assignment (VAR=val)
                                if (/^[a-zA-Z0-9_]+=/.test(line)) {
                                    const [key, ...valParts] = line.split('=');
                                    const val = valParts.join('=');
                                    env[key] = val.replace(/^["']|["']$/g, '');
                                    continue;
                                }

                                // 3. Parse Command
                                const parts = line.match(/[^\s"']+|"([^"]*)"|'([^']*)'/g) || [];
                                const cmdArgs = parts.map(p => {
                                    let arg = p;
                                    if (arg.startsWith('"') && arg.endsWith('"')) arg = arg.slice(1, -1);
                                    else if (arg.startsWith("'") && arg.endsWith("'")) arg = arg.slice(1, -1);
                                    return arg;
                                });

                                if (cmdArgs.length === 0) continue;
                                const cmdName = cmdArgs[0];
                                const args = cmdArgs.slice(1);

                                const cmd = getCommand(cmdName) || availableCmds.find(c => c.name === cmdName);

                                if (cmd) {
                                    try {
                                        // Execute with LOCAL context
                                        const result = await cmd.execute({
                                            args,
                                            fileSystem: createScopedFileSystem(activeTerminalUser) as any,
                                            currentPath: localCurrentPath,
                                            setCurrentPath: () => {
                                                // No-op here, we rely on result.newCwd
                                            },
                                            resolvePath: resolveLocalPath,
                                            allCommands: availableCmds,
                                            terminalUser: activeTerminalUser,
                                            spawnSession: pushSession,
                                            closeSession: closeSession,
                                            onLaunchApp,
                                            getNodeAtPath,
                                            readFile,
                                            prompt: () => Promise.resolve(''),
                                            print: (c) => scriptOutput.push(c),
                                            isSudoAuthorized,
                                            setIsSudoAuthorized,
                                            verifyPassword
                                        });

                                        if (result.output) scriptOutput.push(...result.output);
                                        if (result.error) scriptError = true;

                                        // Update state if command changed directory
                                        if (result.newCwd) {
                                            localCurrentPath = result.newCwd;
                                            env['PWD'] = localCurrentPath;
                                        }

                                    } catch (e) {
                                        scriptOutput.push(`Error executing ${cmdName}: ${e}`);
                                    }
                                } else {
                                    scriptOutput.push(`${cmdName}: command not found`);
                                    scriptError = true;
                                }
                            }

                            cmdOutput = scriptOutput;
                            cmdError = scriptError;

                        }
                    }
                } else {
                    cmdOutput = [`${command}: command not found`];
                    cmdError = true;
                }
            }


            if (isAppLaunch) {
                if (onLaunchApp) {
                    onLaunchApp(launchAppId, args, activeTerminalUser);
                    cmdOutput = [`Launched ${launchAppId} as ${activeTerminalUser}`];
                } else {
                    cmdOutput = [`Cannot launch ${launchAppId}`];
                    cmdError = true;
                }
            } else if (targetCommandName && !cmdError) {
                const terminalCommand = getCommand(targetCommandName);
                if (terminalCommand) {
                    const availableCmds = getAvailableCommands();
                    const result = await terminalCommand.execute({
                        args: args,
                        fileSystem: createScopedFileSystem(activeTerminalUser) as any,
                        currentPath: currentPath,
                        setCurrentPath: setCurrentPath,
                        resolvePath: resolvePath,
                        allCommands: availableCmds,
                        terminalUser: activeTerminalUser,
                        spawnSession: pushSession,
                        closeSession: closeSession,
                        onLaunchApp: onLaunchApp,
                        getNodeAtPath: getNodeAtPath,
                        readFile: readFile,
                        prompt: (m, t) => prompt(m, t, historyId),
                        print: (content: string | ReactNode) => {
                            setHistory(prev => {
                                const newHistory = [...prev];
                                const idx = newHistory.findIndex(h => h.id === historyId);
                                if (idx !== -1) {
                                    newHistory[idx] = {
                                        ...newHistory[idx],
                                        output: [...newHistory[idx].output, content]
                                    };
                                }
                                return newHistory;
                            });
                        },
                        isSudoAuthorized: isSudoAuthorized,
                        setIsSudoAuthorized: setIsSudoAuthorized,
                        verifyPassword: verifyPassword
                    });

                    cmdOutput = result.output;
                    cmdError = !!result.error;
                    if (result.shouldClear) {
                        shouldClear = true;
                    }
                } else {
                    cmdOutput = [`${command}: Broken binary reference (maps to '${targetCommandName}' which is missing implementation)`];
                    cmdError = true;
                }
            }

            return { output: cmdOutput, error: cmdError, shouldClear };
        };

        const result = await generateOutput();
        output = result.output;
        error = result.error;

        if (result.shouldClear) {
            setHistory([]);
            setInput('');
            setHistoryIndex(-1);
            return;
        }

        if (redirectOp && redirectPath) {
            const textContent = output.map(o => {
                if (typeof o === 'string') return o;
                if (typeof o === 'number') return String(o);
                return '';
            }).filter(s => s !== '').join('\n');

            if (redirectPath) {
                let finalContent = textContent;
                const appendMode = redirectOp === '>>';
                const absRedirectPath = resolvePath(redirectPath);
                const existingNode = getNodeAtPath(absRedirectPath, activeTerminalUser);
                const parentPath = absRedirectPath.substring(0, absRedirectPath.lastIndexOf('/')) || '/';
                const fileName = absRedirectPath.substring(absRedirectPath.lastIndexOf('/') + 1);

                const parentNode = getNodeAtPath(parentPath, activeTerminalUser);
                if (!parentNode || parentNode.type !== 'directory') {
                    output = [`zsh: no such file or directory: ${redirectPath}`];
                    error = true;
                } else {
                    if (appendMode && existingNode && existingNode.type === 'file' && existingNode.content !== undefined) {
                        finalContent = existingNode.content + '\n' + textContent;
                    }

                    if (existingNode) {
                        const success = writeFile(absRedirectPath, finalContent, activeTerminalUser);
                        if (!success) {
                            output = [`zsh: permission denied: ${redirectPath}`];
                            error = true;
                        }
                    } else {
                        const success = createFile(parentPath, fileName, finalContent, activeTerminalUser);
                        if (!success) {
                            output = [`zsh: permission denied: ${redirectPath}`];
                            error = true;
                        }
                    }
                    if (!error) output = [];
                }
            }
        }

        setHistory(prev => {
            const newHistory = [...prev];
            const idx = newHistory.findIndex(h => h.id === historyId);
            if (idx !== -1) {
                newHistory[idx] = {
                    ...newHistory[idx],
                    output: [...newHistory[idx].output, ...output],
                    error
                };
            }
            return newHistory;
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.ctrlKey) {
            switch (e.key) {
                case 'l':
                    e.preventDefault();
                    setHistory([]);
                    return;
                case 'c':
                    e.preventDefault();
                    setInput('');
                    setHistory(prev => [
                        ...prev,
                        {
                            id: crypto.randomUUID(),
                            command: input + '^C',
                            output: [],
                            error: false,
                            path: currentPath,
                            user: activeTerminalUser,
                            accentColor: termAccent
                        }
                    ]);
                    return;
                case 'u':
                    e.preventDefault();
                    setInput('');
                    return;
            }
        }

        if (e.key === 'Enter') {
            executeCommand(input);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                const cmd = commandHistory[commandHistory.length - 1 - newIndex];
                if (cmd) setInput(cmd);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                const cmd = commandHistory[commandHistory.length - 1 - newIndex];
                if (cmd) setInput(cmd);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        } else if (e.key === 'Tab') {
            handleTabCompletion(e);
        }
    };

    // Integrity Check Side Effect
    useEffect(() => {
        if (integrityCheckRun.current) return;
        const timer = setTimeout(() => {
            if (!validateIntegrity()) {
                integrityCheckRun.current = true;
                setHistory(prev => [
                    ...prev,
                    {
                        id: crypto.randomUUID(),
                        command: '',
                        output: [
                            <div className="text-red-500 font-bold bg-red-950/30 p-2 border border-red-500/50 rounded mb-2" key="integrity-error">
                                CRITICAL ERROR: SYSTEM INTEGRITY COMPROMISED < br />
                                The system has detected unauthorized modifications to core identity files.< br />
                                Entering Safe Mode: Write access disabled.Root access disabled.
                            </div>
                        ],
                        path: currentPath || '~',
                        user: activeTerminalUser,
                        accentColor: '#ef4444'
                    }
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
        isSudoAuthorized,
        setIsSudoAuthorized
    };
}
