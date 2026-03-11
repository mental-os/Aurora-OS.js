import { ReactNode } from "react";
import { FileSystemContextType } from "@/components/FileSystemContext";

export interface CommandContext {
  args: string[];
  stdin?: string[]; // Input from pipe
  fileSystem: FileSystemContextType;
  currentPath: string;
  setCurrentPath: (path: string) => void;
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
  prompt: (message: string, type?: "text" | "password") => Promise<string>;
  isSudoAuthorized: boolean;
  setIsSudoAuthorized: (v: boolean) => void;
  verifyPassword: (username: string, passwordToTry: string) => boolean;
  print: (content: string | React.ReactNode) => void;
  t: (key: string, options?: any) => string;
  getCommandHistory: () => string[];
  clearCommandHistory: () => void;
  getCommandFavorites: () => Set<number>;
  setCommandFavorite: (lineNumber: number, isFavorite: boolean) => void;
  closeWindow?: () => void;
  isRootSession: boolean;
  connectedTo: string | null;
  connect: (ip: string) => void;
  disconnect: () => void;
}

export interface CommandResult {
  output: (string | ReactNode)[];
  error?: boolean;
  shouldClear?: boolean;
  newCwd?: string;
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
