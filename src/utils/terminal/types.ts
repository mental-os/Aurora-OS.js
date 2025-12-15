import { ReactNode } from 'react';
import { FileSystemContextType } from '../../components/FileSystemContext';

export interface CommandContext {
    args: string[];
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
}

export interface CommandResult {
    output: (string | ReactNode)[];
    error?: boolean;
    shouldClear?: boolean; // Special flag for 'clear' command
}

export interface TerminalCommand {
    name: string;
    description: string;
    usage?: string;
    execute: (context: CommandContext) => Promise<CommandResult> | CommandResult;
}
