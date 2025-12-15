# Aurora OS Codebase Documentation

This document outlines the custom logic, classes, and utility functions implemented in Aurora OS. It excludes standard React/library boilerplate.

## 1. System Utilities (`src/utils`)

### File System (`fileSystemUtils.ts`)

```typescript
// Core Data Structures
interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
  permissions?: string; // e.g. 'rwxr-xr-x'
  owner?: string;
  group?: string; 
  size?: number;
  modified?: Date;
}

interface User {
  username: string;
  password?: string;
  uid: number;
  gid: number;
  fullName: string;
  homeDir: string;
  shell: string;
  groups?: string[]; // Supplementary groups
}

interface Group {
  groupName: string;
  password?: string;
  gid: number;
  members: string[]; // usernames
}

// Functions
function checkPermissions(node: FileNode, user: User, operation: 'read' | 'write' | 'execute'): boolean
/**
 * Implements Linux-style permission enforcement (rwx). Checks Owner, Group, and Others bits.
 */

function createUserHome(username: string, permissions?: string): FileNode
/**
 * Generates a standard home directory structure (Desktop, Documents, .Config, etc.).
 * Default permissions: 'drwxr-x---' (750)
 */

function deepCloneFileSystem(root: FileNode): FileNode
/**
 * Deep clones the filesystem tree and ensures all nodes have IDs.
 * Used for immutable state updates in React.
 */

function parsePasswd(content: string): User[]
function formatPasswd(users: User[]): string
/**
 * Logic to sync User objects with the textual content of /etc/passwd.
 */

function parseGroup(content: string): Group[]
function formatGroup(groups: Group[]): string
/**
 * Logic to sync Group objects with the textual content of /etc/group.
 */



### Memory Management (`memory.ts`)

```typescript
function softReset(): void
/**
 * Clears "Soft Memory" (Preferences, Desktop Icons, Sound Settings). Safe to run.
 */

function hardReset(): void
/**
 * Clears "Hard Memory" (Filesystem, User Database) + Soft Memory. Equivalent to a factory wipe.
 */

function getStorageStats(): { softMemory: Stats, hardMemory: Stats, total: Stats }
/**
 * Calculates byte usage for storage tiers.
 */

function hasSavedSession(username: string): boolean
/**
 * Checks if a user has active window state in memory.
 */

function clearSession(username: string): void
/**
 * Clears the suspended session data for a specific user.
 */
```

### Grid System (`gridSystem.ts`)

```typescript
interface GridConfig { cellWidth: number; cellHeight: number; startX: number; startY: number; ... }
interface GridPosition { col: number; row: number; }

function getGridConfig(windowWidth: number, windowHeight: number): GridConfig
/**
 * Calculates grid layout based on window dimensions.
 */

function snapToGrid(x: number, y: number, config: GridConfig): { x: number; y: number }
/**
 * Aligns pixel coordinates to nearest grid cell center.
 */

function findNextFreeCell(occupied: Set<string>, config: GridConfig, height: number): GridPosition
/**
 * Finds next empty slot filling Top->Bottom, Right->Left.
 */

function rearrangeGrid(
  iconIds: string[], 
  currentPos: Record<string, GridPosition>, 
  draggedId: string, 
  targetCell: GridPosition, ... 
): Record<string, GridPosition>
/**
 * Complex logic to shift icons aside when dropping one in between others.
 */
```

### Colors (`colors.ts`)

```typescript
function lightenColor(hex: string, percent: number): string
function darkenColor(hex: string, percent: number): string

function mixColors(color1: string, color2: string, weight: number): string
/**
 * Blends two colors together. Weight 0-1.
 */

function getComplementaryColor(hex: string): string
/**
 * Returns the opposite color on the color wheel. Used for 'Contrast' theme.
 */

function hexToRgb(hex: string): { r: number; g: number; b: number }
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number }
function rgbToHex(r: number, g: number, b: number): string
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number }
function getColorShades(hex: string): { lightest: string, light: string, base: string, dark: string, darkest: string }
```

## 2. Global State & Contexts (`src/components`)

### FileSystemContext (`FileSystemContext.tsx`)

Core OS state provider.

```typescript
interface FileSystemContextType {
  // State
  fileSystem: FileNode;
  users: User[];
  groups: Group[];
  currentUser: string | null;
  currentPath: string;

  // Actions
  login(username: string, password?: string): boolean
  logout(): void
  
  addUser(username: string, fullName: string, password?: string): boolean
  deleteUser(username: string): boolean

  addGroup(groupName: string, members?: string[]): boolean
  deleteGroup(groupName: string): boolean

  writeFile(path: string, content: string): boolean
  readFile(path: string): string | null
  createFile(path: string, name: string, content?: string): boolean
  createDirectory(path: string, name: string): boolean
  
  moveNode(fromPath: string, toPath: string): boolean
  deleteNode(path: string): boolean
  
  resetFileSystem(): void

  chmod(path: string, mode: string): boolean
  chown(path: string, owner: string, group?: string): boolean
}
```

### AppContext (`AppContext.tsx`)
Global configuration state.
- **`useAppContext()`**: Accessor for global UI state and System Configuration.
    - **`isLocked`**: Global boolean state triggering the `LoginScreen` overlay.
    - **`switchUser(username)`**: Helper to load user-specific preferences (theme, background, windows).
- **CSS Variable Sync**: Automatically writes state updates to CSS variables (`--accent-user`, `--blur-enabled`) for global styling.

### App Structure (`App.tsx`)

- **`AppContent`**:
    - **Overlay Architecture**: Renders `<OS />` for the active user *behind* the `<LoginScreen />` when `isLocked` is true.
    - **State Management**: Uses `useWindowManager` to handle window lifecycle and persistence, keeping the main component clean.

## 3. Applications (`src/components/apps` & `FileManager.tsx`)


### Finder (`FileManager.tsx`)
The primary file explorer.
- **`navigateTo(path)`**: **[SECURE]** Pre-checks `read` and `execute` permissions before entering a directory. Prevents access to restricted folders (e.g., `/root`).
- **Sidebar & Breadcrumbs**: Dynamic navigation components that respect the current browsing context.

### Terminal (`Terminal.tsx` & `src/utils/terminal`)
Zsh-like terminal emulator with modular command architecture.

**Command Structure (`TerminalCommand`)**:
```typescript
interface TerminalCommand {
    name: string;
    description: string;
    usage: string;
    execute: (context: CommandContext) => CommandResult | Promise<CommandResult>;
}
```

**Key Features**:
- **Output Redirection**: Parses `>` and `>>` to write command output to files (supports overwriting and appending).
- **User Switching**: `su` and `sudo` commands allow switching the active simulation user.
- **Registry**: Commands are registered in `registry.ts` for O(1) lookup.
- **Session Isolation**:
    - **Session Stack**: A generic stack (`activeTerminalUser[]`) manages nested sessions (e.g. `user` -> `root`). `exit` pops the stack.
    - **Scoped FileSystem**: `createScopedFileSystem(asUser)` wraps the `FileSystemContext` to enforce permissions based on the active terminal user, not the global desktop user.
    - **Command Context**: Commands receive `terminalUser`, `spawnSession`, and `closeSession` to manage their own lifecycle.


## 4. Custom Hooks (`src/hooks`)

### `useWindowManager(activeUser, contentFactory)`

```typescript
function useWindowManager(): {
  windows: WindowState[];
  openWindow(type: string, data?: any): void;
  closeWindow(id: string): void;
  minimizeWindow(id: string): void;
  maximizeWindow(id: string): void;
  focusWindow(id: string): void;
}
/**
 * Encapsulates all window management logic:
 * - Maintenance of Z-Index stacking order.
 * - Persistent storage of open windows to Memory.
 * - Minimization/Maximization state toggling.
 */
```

### `useThemeColors()`

```typescript
function useThemeColors(): {
  accentColor: string;
  themeMode: 'neutral' | 'shades' | 'contrast';
  blurEnabled: boolean;
  
  // Use this for generic backgrounds
  getBackgroundColor(opacity?: number): string; 

  // Pre-defined hierarchy (use these preferentially)
  windowBackground: string;      // Content layers
  sidebarBackground: string;     // Sidebars
  titleBarBackground: string;    // Headers
  dockBackground: string;        // Dock
  
  blurStyle: React.CSSProperties; // { backdropFilter: ... }
}
```

### `useAppStorage(appId, initial)`
Namespaced persistence hook.
- Wraps `localStorage` but prefixes keys with `aurora-os-app-${appId}`.
- Allows apps (Finder, Terminal) to save state without colliding or needing to manage raw storage keys.

## 5. Services (`src/services`)

### SoundManager (`sound.ts`)

```typescript
type SoundType = 'success' | 'warning' | 'error' | 'click' | 'hover' | 'folder' | 'window-open' | 'window-close';
type SoundCategory = 'master' | 'system' | 'ui' | 'feedback';

class SoundManager {
  static getInstance(): SoundManager
  
  play(type: SoundType): void
  setVolume(category: SoundCategory, value: number): void
  setMute(muted: boolean): void
}

export const soundManager: SoundManager;
```

### NotificationService (`notifications.tsx`)

```typescript
export const notify = {
  system: (type: 'success'|'warning'|'error', source: string, message: string) => void
}
/**
 * Triggers a system toast + corresponding audio feedback.
 */
```

## 6. System Migrations (`src/utils/migrations.ts`)

To ensure backward compatibility for users on GitHub Pages (who persist data via `localStorage`), Aurora OS implements an automated migration strategy.

### Mechanism
Implements a "Smart Merge" strategy that prioritizes user customizations while delivering new system features.

1.  **Version Tracking**: Checks `package.json` vs `localStorage`.
2.  **Detection**: If version mismatch:
    -   **New Features**: Adds *new* files/directories found in the update (e.g., adding `/bin/netcat`).
    -   **Respect Modifications**: If a file exists in the user's storage (e.g., custom `/sys/kernel`), it is **preserved**.
    -   **Critical Updates**: Only overwrites files if they are flagged as functionally incompatible with the new engine (rare).
    -   **Schema Healing**: Auto-fixes data structure issues (e.g., missing IDs, outdated user objects).
3.  **Result**: Users get new features without losing their "hacks" or custom configs.
