import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import {
  FileNode,
  deepCloneFileSystem,
  User,
  formatPasswd,
  type Group,
  formatGroup
} from '../utils/fileSystemUtils';

import { validateIntegrity } from '../utils/integrity';
export { validateIntegrity };

export type { FileNode, User, Group } from '../utils/fileSystemUtils';

import { useFileSystemState } from '../hooks/fileSystem/useFileSystemState';
import { useAuth } from '../hooks/fileSystem/useAuth';
import { useFileSystemQueries } from '../hooks/fileSystem/useFileSystemQueries';
import { useFileSystemMutations } from '../hooks/fileSystem/useFileSystemMutations';
import { notify } from '../services/notifications';
import { getCoreApps } from '../config/appRegistry';
import { STORAGE_KEYS } from '../utils/memory';

export interface FileSystemContextType {
  fileSystem: FileNode;
  isSafeMode: boolean; // Integrity Status
  currentPath: string;
  currentUser: string | null;
  users: User[];
  homePath: string;
  setCurrentPath: (path: string) => void;
  getNodeAtPath: (path: string, asUser?: string) => FileNode | null;
  createFile: (path: string, name: string, content?: string, asUser?: string) => boolean;
  createDirectory: (path: string, name: string, asUser?: string) => boolean;
  deleteNode: (path: string, asUser?: string) => boolean;
  addUser: (username: string, fullName: string, password?: string, asUser?: string) => boolean;
  deleteUser: (username: string, asUser?: string) => boolean;
  writeFile: (path: string, content: string, asUser?: string) => boolean;
  readFile: (path: string, asUser?: string) => string | null;
  listDirectory: (path: string, asUser?: string) => FileNode[] | null;
  moveNode: (fromPath: string, toPath: string, asUser?: string) => boolean;
  moveNodeById: (id: string, destParentPath: string, asUser?: string) => boolean;
  moveToTrash: (path: string, asUser?: string) => boolean;
  emptyTrash: () => void;
  resolvePath: (path: string, asUser?: string) => string;
  resetFileSystem: () => void;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  chmod: (path: string, mode: string, asUser?: string) => boolean;
  chown: (path: string, owner: string, group?: string, asUser?: string) => boolean;
  verifyPassword: (username: string, passwordToTry: string) => boolean;
  groups: Group[];
  addGroup: (groupName: string, members?: string[]) => boolean;
  deleteGroup: (groupName: string) => boolean;
  installedApps: Set<string>;
  installApp: (appId: string) => boolean;
  uninstallApp: (appId: string) => boolean;
  isAppInstalled: (appId: string) => boolean;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export function FileSystemProvider({ children }: { children: ReactNode }) {
  // 1. State & Persistence
  const {
    fileSystem,
    setFileSystem,
    isSafeMode,
    resetFileSystemState
  } = useFileSystemState();

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
    deleteUser,
    addGroup,
    deleteGroup,
    resetAuthState,
    verifyUserPassword
  } = useAuth(fileSystem, setFileSystem);

  // 3. Path Management
  const homePath = currentUser === 'root' ? '/root' : currentUser ? `/home/${currentUser}` : '/';
  const [currentPath, setCurrentPath] = useState(homePath);

  // Update currentPath when user logs in if currently at root or undefined
  useEffect(() => {
    if (currentUser) {
      const newHome = currentUser === 'root' ? '/root' : `/home/${currentUser}`;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPath(newHome);
    }
  }, [currentUser]);

  // 4. Queries (Read)
  const {
    resolvePath,
    getNodeAtPath,
    listDirectory,
    readFile
  } = useFileSystemQueries(
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
      console.error('Failed to load installed apps:', e);
    }
    // Default to only core apps (mimicking Linux behavior)
    // Optional apps must be installed via App Store
    return new Set(getCoreApps().map(app => app.id));
  });

  // Persist installed apps
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INSTALLED_APPS, JSON.stringify(Array.from(installedApps)));
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
    chown
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
    getNodeAtPath
  });

  // Install app function
  const installApp = useCallback((appId: string): boolean => {
    if (installedApps.has(appId)) {
      return false; // Already installed
    }

    setInstalledApps(prev => new Set([...prev, appId]));

    // Create app binary in /usr/bin with shebang format for Terminal
    // Must use 'root' since /usr/bin is root-owned and requires root permissions
    const binaryContent = `#!app ${appId}`;
    const success = createFile('/usr/bin', appId, binaryContent, 'root');
    if (success) {
      notify.system('success', 'App Store', `${appId} installed successfully`);
    }
    return success;
  }, [installedApps, createFile]);

  // Uninstall app function
  const uninstallApp = useCallback((appId: string): boolean => {
    // Check if app is core (cannot uninstall)
    const coreAppIds = getCoreApps().map(app => app.id);
    if (coreAppIds.includes(appId)) {
      notify.system('error', 'App Store', `Cannot uninstall ${appId}: Core app`);
      return false;
    }

    if (!installedApps.has(appId)) {
      return false; // Not installed
    }

    setInstalledApps(prev => {
      const newSet = new Set(prev);
      newSet.delete(appId);
      return newSet;
    });

    // Delete app binary from /usr/bin
    // Must use 'root' since /usr/bin is root-owned and requires root permissions
    const success = deleteNode(`/usr/bin/${appId}`, 'root');
    if (success) {
      notify.system('success', 'App Store', `${appId} uninstalled successfully`);
    }
    return success;
  }, [installedApps, deleteNode]);

  // Check if app is installed
  const isAppInstalled = useCallback((appId: string): boolean => {
    return installedApps.has(appId);
  }, [installedApps]);

  // 6. Reset Logic (Unified)
  const resetFileSystem = useCallback(() => {
    // Reset installed apps to core apps only
    const coreAppIds = getCoreApps().map(app => app.id);
    setInstalledApps(new Set(coreAppIds));
    localStorage.removeItem('aurora-installed-apps');

    // Reset filesystem and auth
    resetFileSystemState();
    resetAuthState();

    notify.system('success', 'System', 'System reset to factory defaults');
  }, [resetFileSystemState, resetAuthState]);

  // 7. Sync users State -> Filesystem (/etc/passwd)
  useEffect(() => {
    const passwdContent = formatPasswd(users);

    setFileSystem(prevFS => {
      const newFS = deepCloneFileSystem(prevFS);
      const etc = newFS.children?.find(c => c.name === 'etc');
      if (etc && etc.children) {
        let passwd = etc.children.find(c => c.name === 'passwd');
        if (!passwd) {
          passwd = { id: crypto.randomUUID(), name: 'passwd', type: 'file', content: '', owner: 'root', permissions: '-rw-r--r--' };
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

    setFileSystem(prevFS => {
      const newFS = deepCloneFileSystem(prevFS);
      const etc = newFS.children?.find(c => c.name === 'etc');
      if (etc && etc.children) {
        let groupFile = etc.children.find(c => c.name === 'group');
        if (!groupFile) {
          groupFile = { id: crypto.randomUUID(), name: 'group', type: 'file', content: '', owner: 'root', permissions: '-rw-r--r--' };
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

  const value: FileSystemContextType = {
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
    deleteGroup,
    installedApps,
    installApp,
    uninstallApp,
    isAppInstalled
  };

  return (
    <FileSystemContext.Provider value={value}>
      {children}
    </FileSystemContext.Provider>
  );
}

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (context === undefined) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};
