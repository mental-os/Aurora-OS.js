import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  FileNode,
  deepCloneFileSystem,
  User,
  formatPasswd,
  type Group,
  formatGroup,
} from "../utils/fileSystemUtils";

import { validateIntegrity } from "../utils/integrity";
export { validateIntegrity };

export type { FileNode, User, Group } from "../utils/fileSystemUtils";

import { useFileSystemState } from "../hooks/fileSystem/useFileSystemState";
import { useAuth } from "../hooks/fileSystem/useAuth";
import { useFileSystemQueries } from "../hooks/fileSystem/useFileSystemQueries";
import { useFileSystemMutations } from "../hooks/fileSystem/useFileSystemMutations";
import { notify } from "../services/notifications";
import { CORE_APP_IDS } from "../config/appConstants";
import { STORAGE_KEYS } from "../utils/memory";

export interface ClipboardItem {
  id: string; // FileNode ID
  sourceUserContext: string; // User who owns the "source" window/process
}

export interface ClipboardState {
  items: ClipboardItem[];
  operation: 'copy' | 'cut';
}

export interface FileSystemContextType {
  fileSystem: FileNode;
  isSafeMode: boolean; // Integrity Status
  currentPath: string;
  currentUser: string | null;
  users: User[];
  homePath: string;
  setCurrentPath: (path: string) => void;
  getNodeAtPath: (path: string, asUser?: string) => FileNode | null;
  createFile: (
    path: string,
    name: string,
    content?: string,
    asUser?: string,
    permissions?: string
  ) => boolean;
  createDirectory: (path: string, name: string, asUser?: string) => boolean;
  deleteNode: (path: string, asUser?: string) => boolean;
  addUser: (
    username: string,
    fullName: string,
    password?: string,
    passwordHint?: string,
    asUser?: string,
    populateHome?: boolean
  ) => boolean;
  updateUser: (
    username: string,
    updates: { fullName?: string; password?: string; passwordHint?: string; isAdmin?: boolean },
    asUser?: string
  ) => boolean;
  deleteUser: (username: string, asUser?: string) => boolean;
  writeFile: (path: string, content: string, asUser?: string) => boolean;
  readFile: (path: string, asUser?: string) => string | null;
  listDirectory: (path: string, asUser?: string) => FileNode[] | null;
  moveNode: (fromPath: string, toPath: string, asUser?: string) => boolean;
  moveNodeById: (
    id: string,
    destParentPath: string,
    asUser?: string,
    sourceUserContext?: string
  ) => boolean;
  moveToTrash: (path: string, asUser?: string) => boolean;
  emptyTrash: () => void;
  resolvePath: (path: string, asUser?: string) => string;
  resetFileSystem: () => void;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  chmod: (path: string, mode: string, asUser?: string) => boolean;
  chown: (
    path: string,
    owner: string,
    group?: string,
    asUser?: string
  ) => boolean;
  verifyPassword: (username: string, passwordToTry: string) => boolean;
  groups: Group[];
  addGroup: (groupName: string, members?: string[]) => boolean;
  addUserToGroup: (username: string, groupName: string) => boolean;
  removeUserFromGroup: (username: string, groupName: string) => boolean;
  deleteGroup: (groupName: string) => boolean;
  installedApps: Set<string>;
  installApp: (appId: string, asUser?: string) => boolean;
  uninstallApp: (appId: string, asUser?: string) => boolean;
  isAppInstalled: (appId: string) => boolean;
  saveFileSystem: () => void;
  // Clipboard
  clipboard: ClipboardState;
  copyNodes: (ids: string[], sourceUserContext: string) => void;
  cutNodes: (ids: string[], sourceUserContext: string) => void;
  pasteNodes: (destPath: string, asUser?: string) => void; // asUser = paster
  copyNodeById: (id: string, destParentPath: string, asUser?: string, sourceUserContext?: string) => boolean;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(
  undefined
);

export function FileSystemProvider({ children }: { children: ReactNode }) {
  // 1. State & Persistence
  const { fileSystem, setFileSystem, isSafeMode, resetFileSystemState, saveNow } =
    useFileSystemState();

  // 2. Auth & User Management
  const {
    users,
    setUsers,
    groups,
    setGroups,
    currentUser,
    getCurrentUser,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    addGroup,
    addUserToGroup,
    removeUserFromGroup,
    deleteGroup,
    resetAuthState,
    verifyUserPassword,
  } = useAuth(fileSystem, setFileSystem);

  // 3. Path Management
  const homePath =
    currentUser === "root"
      ? "/root"
      : currentUser
        ? `/home/${currentUser}`
        : "/";
  const [currentPath, setCurrentPath] = useState(homePath);

  // Update currentPath when user logs in if currently at root or undefined
  useEffect(() => {
    if (currentUser) {
      const newHome = currentUser === "root" ? "/root" : `/home/${currentUser}`;

      setCurrentPath(newHome);
    }
  }, [currentUser]);

  // 4a. Clipboard State
  const [clipboard, setClipboard] = useState<ClipboardState>({ items: [], operation: 'copy' });

  // 4. Queries (Read)
  const { resolvePath, getNodeAtPath, listDirectory, readFile } =
    useFileSystemQueries(
      fileSystem,
      users,
      currentPath,
      homePath,
      getCurrentUser,
      currentUser
    );

  // Installed Apps State
  const [installedApps, setInstalledApps] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INSTALLED_APPS);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load installed apps:", e);
    }
    // Default to only core apps (mimicking Linux behavior)
    // Optional apps must be installed via App Store
    return new Set(CORE_APP_IDS);
  });

  // Persist installed apps
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.INSTALLED_APPS,
      JSON.stringify(Array.from(installedApps))
    );
  }, [installedApps]);

  // 5. Mutations (Write)
  const {
    deleteNode,
    moveNode,
    moveNodeById,
    moveToTrash,
    emptyTrash,
    createFile,
    createDirectory,
    writeFile,
    chmod,
    chown,
    copyNodeById,
  } = useFileSystemMutations({
    fileSystem,
    setFileSystem,
    users,
    setUsers,
    groups,
    setGroups,
    currentUser,
    getCurrentUser,
    resolvePath,
    getNodeAtPath,
  });
  
  // Clipboard Logic
  const copyNodes = useCallback((ids: string[], sourceUserContext: string) => {
    setClipboard({
      items: ids.map(id => ({ id, sourceUserContext })),
      operation: 'copy'
    });
  }, []);

  const cutNodes = useCallback((ids: string[], sourceUserContext: string) => {
    setClipboard({
      items: ids.map(id => ({ id, sourceUserContext })),
      operation: 'cut'
    });
  }, []);

  const pasteNodes = useCallback((destPath: string, asUser?: string) => {
    if (clipboard.items.length === 0) return;

    let successCount = 0;
    const destUser = asUser || currentUser || undefined;

    clipboard.items.forEach(item => {
       if (clipboard.operation === 'copy') {
          // We need copyNodeById exposed from mutations!
          if (copyNodeById(item.id, destPath, destUser, item.sourceUserContext)) {
             successCount++;
          }
       } else {
          // Cut -> Move
          if (moveNodeById(item.id, destPath, destUser, item.sourceUserContext)) {
             successCount++;
          }
       }
    });

    if (successCount > 0) {
       // Optional: Clear clipboard on cut? Standard OS behavior is usually clear or keep?
       // Windows/Mac keeps it until next copy/cut usually, but "Cut" fails if file gone.
       // Actually "Cut" usually grays out item. Here we don't visual gray out yet.
       // If we move it, the ID might change if we didn't support proper move, but moveNodeById preserves node (and ID usually).
       // Actually moveNodeById removes from source and adds to dest. ID persists.
       // So we can paste again? No, "Cut" is usually one-time paste.
       if (clipboard.operation === 'cut') {
          setClipboard({ items: [], operation: 'copy' }); // Reset
       }
       notify.system('success', 'Clipboard', `Pasted ${successCount} item(s)`);
    }
  }, [clipboard, moveNodeById, copyNodeById, currentUser]);

  // Install app function
  const installApp = useCallback(
    (appId: string, asUser?: string): boolean => {
      // 1. Permission Check
      const effectiveUserName = asUser || currentUser;
      if (!effectiveUserName) return false;

      const user = users.find((u) => u.username === effectiveUserName);
      const isRoot = effectiveUserName === "root";
      const isAdmin =
        user?.groups?.includes("admin") || user?.groups?.includes("root");

      if (!isRoot && !isAdmin) {
        notify.system(
          "error",
          "Permission Denied",
          "Admin privileges required to install apps"
        );
        return false;
      }

      if (installedApps.has(appId)) {
        return false; // Already installed
      }

      setInstalledApps((prev) => new Set([...prev, appId]));

      // Create app binary in /usr/bin with shebang format for Terminal
      // Must use 'root' since /usr/bin is root-owned and requires root permissions
      const binaryContent = `#!app ${appId}`;
      // We execute the file creation as 'root' because the system is doing it on behalf of the admin user
      // Fix: Ensure binary is executable by everyone (-rwxr-xr-x / 755)
      const success = createFile("/usr/bin", appId, binaryContent, "root", "-rwxr-xr-x");
      if (success) {
        notify.system(
          "success",
          "App Store",
          `${appId} installed successfully`
        );
      }
      return success;
    },
    [installedApps, createFile, currentUser, users]
  );

  // Uninstall app function
  const uninstallApp = useCallback(
    (appId: string, asUser?: string): boolean => {
      // 1. Permission Check
      const effectiveUserName = asUser || currentUser;
      if (!effectiveUserName) return false;

      const user = users.find((u) => u.username === effectiveUserName);
      const isRoot = effectiveUserName === "root";
      const isAdmin =
        user?.groups?.includes("admin") || user?.groups?.includes("root");

      if (!isRoot && !isAdmin) {
        notify.system(
          "error",
          "Permission Denied",
          "Admin privileges required to uninstall apps"
        );
        return false;
      }

      // Check if app is core (cannot uninstall)
      // Checks against CORE_APP_IDS constant instead of registry
      if (CORE_APP_IDS.includes(appId as any)) {
        notify.system(
          "error",
          "App Store",
          `Cannot uninstall ${appId}: Core app`
        );
        return false;
      }

      if (!installedApps.has(appId)) {
        return false; // Not installed
      }

      setInstalledApps((prev) => {
        const newSet = new Set(prev);
        newSet.delete(appId);
        return newSet;
      });

      // Delete app binary from /usr/bin
      // Must use 'root' since /usr/bin is root-owned and requires root permissions
      const success = deleteNode(`/usr/bin/${appId}`, "root");
      if (success) {
        notify.system(
          "success",
          "App Store",
          `${appId} uninstalled successfully`
        );
      }
      return success;
    },
    [installedApps, deleteNode, currentUser, users]
  );

  // Check if app is installed
  const isAppInstalled = useCallback(
    (appId: string): boolean => {
      return installedApps.has(appId);
    },
    [installedApps]
  );

  // 6. Reset Logic (Unified)
  const resetFileSystem = useCallback(() => {
    // Reset installed apps to core apps only
    setInstalledApps(new Set(CORE_APP_IDS));
    localStorage.removeItem("yami-installed-apps");

    // Reset filesystem and auth
    resetFileSystemState();
    resetAuthState();

    notify.system("success", "System", "System reset to factory defaults");
  }, [resetFileSystemState, resetAuthState]);

  // 7. Sync users State -> Filesystem (/etc/passwd)
  useEffect(() => {
    const passwdContent = formatPasswd(users);

    setFileSystem((prevFS) => {
      const newFS = deepCloneFileSystem(prevFS);
      const etc = newFS.children?.find((c) => c.name === "etc");
      if (etc && etc.children) {
        let passwd = etc.children.find((c) => c.name === "passwd");
        if (!passwd) {
          passwd = {
            id: crypto.randomUUID(),
            name: "passwd",
            type: "file",
            content: "",
            owner: "root",
            permissions: "-rw-r--r--",
          };
          etc.children.push(passwd);
        }

        if (passwd.content !== passwdContent) {
          passwd.content = passwdContent;
          passwd.modified = new Date();
          return newFS;
        }
      }
      return prevFS;
    });
  }, [users, setFileSystem]);

  // 8. Sync groups State -> Filesystem (/etc/group)
  useEffect(() => {
    const groupContent = formatGroup(groups);

    setFileSystem((prevFS) => {
      const newFS = deepCloneFileSystem(prevFS);
      const etc = newFS.children?.find((c) => c.name === "etc");
      if (etc && etc.children) {
        let groupFile = etc.children.find((c) => c.name === "group");
        if (!groupFile) {
          groupFile = {
            id: crypto.randomUUID(),
            name: "group",
            type: "file",
            content: "",
            owner: "root",
            permissions: "-rw-r--r--",
          };
          etc.children.push(groupFile);
        }

        if (groupFile.content !== groupContent) {
          groupFile.content = groupContent;
          groupFile.modified = new Date();
          return newFS;
        }
      }
      return prevFS;
    });
  }, [groups, setFileSystem]);

  const value: FileSystemContextType = useMemo(() => ({
    fileSystem,
    isSafeMode,
    currentPath,
    currentUser,
    users,
    homePath,
    setCurrentPath,
    getNodeAtPath,
    createFile,
    createDirectory,
    deleteNode,
    addUser,
    updateUser,
    deleteUser,
    writeFile,
    readFile,
    listDirectory,
    moveNode,
    moveNodeById,
    moveToTrash,
    emptyTrash,
    resolvePath,
    resetFileSystem,
    login,
    logout,
    chmod,
    chown,
    verifyPassword: verifyUserPassword,
    groups,
    addGroup,
    addUserToGroup,
    removeUserFromGroup,
    deleteGroup,
    installedApps,
    installApp,
    uninstallApp,
    isAppInstalled,
    saveFileSystem: saveNow,
    clipboard,
    copyNodes,
    cutNodes,
    pasteNodes,
    copyNodeById,
  }), [
    fileSystem,
    isSafeMode,
    currentPath,
    currentUser,
    users,
    homePath,
    setCurrentPath,
    getNodeAtPath,
    createFile,
    createDirectory,
    deleteNode,
    addUser,
    updateUser,
    deleteUser,
    writeFile,
    readFile,
    listDirectory,
    moveNode,
    moveNodeById,
    moveToTrash,
    emptyTrash,
    resolvePath,
    resetFileSystem,
    login,
    logout,
    chmod,
    chown,
    verifyUserPassword,
    groups,
    addGroup,
    addUserToGroup,
    removeUserFromGroup,
    deleteGroup,
    installedApps,
    installApp,
    uninstallApp,
    isAppInstalled,
    saveNow,
    clipboard,
    copyNodes,
    cutNodes,
    pasteNodes,
    copyNodeById,
  ]);

  return (
    <FileSystemContext.Provider value={value}>
      {children}
    </FileSystemContext.Provider>
  );
}

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (context === undefined) {
    throw new Error("useFileSystem must be used within a FileSystemProvider");
  }
  return context;
};
