import { ReactNode } from 'react';
import { FileSystemContextType } from '../../components/FileSystemContext';

export interface CommandContext {
    args: string[];
    stdin?: string[]; // Input from pipe
    fileSystem: FileSystemContextType;
    currentPath: string;
    setCurrentPath: (path: string) => void;
    // Helper to resolve paths relative to Terminal's current directory (cwd)
    // The main context.resolvePath resolves relative to IT'S tracked path, which might differ if we have multiple terminals.
    // So we pass the local resolver.
    resolvePath: (path: string) => string;
    allCommands: TerminalCommand[];
    terminalUser: string;
    spawnSession: (username: string) => void;
    closeSession: () => void;
    onLaunchApp?: (appId: string, args: string[], owner?: string) => void;
    getNodeAtPath: (path: string, asUser?: string) => any;
    readFile: (path: string, asUser?: string) => string | null;
    prompt: (message: string, type?: 'text' | 'password') => Promise<string>;
    isSudoAuthorized: boolean;
    setIsSudoAuthorized: (v: boolean) => void;
    verifyPassword: (username: string, passwordToTry: string) => boolean;
    print: (content: string | React.ReactNode) => void;
    t: (key: string, options?: any) => string;
    getCommandHistory: () => string[];
    clearCommandHistory: () => void;
    closeWindow?: () => void;
    isRootSession: boolean;
}

export interface CommandResult {
    output: (string | ReactNode)[];
    error?: boolean;
    shouldClear?: boolean; // Special flag for 'clear' command
    newCwd?: string; // New current working directory (e.g. from 'cd')
}

export interface TerminalCommand {
    name: string;
    description: string;
    descriptionKey?: string;
    usage?: string;
    usageKey?: string;
    hidden?: boolean;
    execute: (context: CommandContext) => Promise<CommandResult> | CommandResult;
}
