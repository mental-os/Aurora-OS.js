import { ReactNode } from "react";
import { FileSystemContextType } from "@/components/FileSystemContext";

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
  onLaunchApp?: (
    appId: string,
    args: string[],
    owner?: string,
    remoteComputerId?: string,
  ) => void;
  getNodeAtPath: (path: string, asUser?: string) => any;
  readFile: (path: string, asUser?: string) => string | null;
  /**
   * Prompt the user for interactive input (e.g. a password).
   * Resolves with the entered text, or `null` if the user cancelled the
   * prompt (Ctrl+C). Callers must treat `null` as an aborted action.
   */
  prompt: (
    message: string,
    type?: "text" | "password",
  ) => Promise<string | null>;
  isSudoAuthorized: boolean;
  setIsSudoAuthorized: (v: boolean) => void;
  verifyPassword: (username: string, passwordToTry: string) => boolean;
  print: (content: string | React.ReactNode) => void;
  t: (key: string, options?: any) => string;
  getCommandHistory: () => string[];
  clearCommandHistory: () => void;
  closeWindow?: () => void;
  isRootSession: boolean;
  /** The IP of the NPC currently connected to, or null if local session. */
  connectedTo: string | null;
  /** Switch terminal context to an NPC computer. */
  connect: (ip: string) => void;
  /** Drop NPC connection and return to local context. */
  disconnect: () => void;
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
