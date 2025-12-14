import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { notify } from '../services/notifications';

import {
  FileNode,
  deepCloneFileNode,
  deepCloneFileSystem,
  ensureIds,
  isDescendant,
  findNodeAndParent,
  initialFileSystem,
  User,
  parsePasswd,
  formatPasswd,
  createUserHome,
  checkPermissions
} from '../utils/fileSystemUtils';

export type { FileNode, User } from '../utils/fileSystemUtils';

export interface FileSystemContextType {
  fileSystem: FileNode;
  currentPath: string;
  currentUser: string | null;
  users: User[];
  homePath: string;
  setCurrentPath: (path: string) => void;
  getNodeAtPath: (path: string) => FileNode | null;
  createFile: (path: string, name: string, content?: string) => boolean;
  createDirectory: (path: string, name: string) => boolean;
  deleteNode: (path: string) => boolean;
  addUser: (username: string, fullName: string, password?: string) => boolean;
  deleteUser: (username: string) => boolean;
  writeFile: (path: string, content: string) => boolean;
  readFile: (path: string) => string | null;
  listDirectory: (path: string) => FileNode[] | null;
  moveNode: (fromPath: string, toPath: string) => boolean;
  moveNodeById: (id: string, destParentPath: string) => boolean;
  moveToTrash: (path: string) => boolean;
  emptyTrash: () => void;
  resolvePath: (path: string) => string;
  resetFileSystem: () => void;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
}

const STORAGE_KEY = 'aurora-filesystem';
const USERS_STORAGE_KEY = 'aurora-users';

// Load filesystem from localStorage or return initial
function loadFileSystem(): FileNode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure IDs exist on stored data (migration)
      return ensureIds(parsed);
    }
  } catch (e) {
    console.warn('Failed to load filesystem from storage:', e);
  }
  return deepCloneFileSystem(initialFileSystem);
}

// Save filesystem to localStorage
function saveFileSystem(fs: FileNode): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fs));
  } catch (e) {
    console.warn('Failed to save filesystem to storage:', e);
  }
}

const DEFAULT_USERS: User[] = [
  { username: 'root', password: 'admin', uid: 0, gid: 0, fullName: 'System Administrator', homeDir: '/root', shell: '/bin/bash', groups: ['root'] },
  { username: 'user', password: '1234', uid: 1000, gid: 1000, fullName: 'User', homeDir: '/home/user', shell: '/bin/bash', groups: ['users', 'admin'] },
  { username: 'guest', password: 'guest', uid: 1001, gid: 1001, fullName: 'Guest', homeDir: '/home/guest', shell: '/bin/bash', groups: ['users'] },
];

// Load users from localStorage
function loadUsers(): User[] {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      console.log('Loaded users from storage:', JSON.parse(stored));
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(u => u.username && typeof u.uid === 'number')) {
        return parsed;
      }
      console.warn('Stored users data corrupted or empty, reverting to defaults');
    }
  } catch (e) {
    console.warn('Failed to load users:', e);
  }
  console.log('Using default users');
  return DEFAULT_USERS;
}

// Helper to get current user object
const getCurrentUser = (username: string | null, users: User[]): User => {
  if (!username) return { username: 'nobody', uid: 65534, gid: 65534, fullName: 'Nobody', homeDir: '/', shell: '' };
  return users.find(u => u.username === username) || {
    username: 'nobody', uid: 65534, gid: 65534, fullName: 'Nobody', homeDir: '/', shell: ''
  };
};

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export function FileSystemProvider({ children }: { children: ReactNode }) {
  const [fileSystem, setFileSystem] = useState<FileNode>(() => loadFileSystem());
  const [users, setUsers] = useState<User[]>(() => loadUsers());
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const homePath = currentUser === 'root' ? '/root' : currentUser ? `/home/${currentUser}` : '/';
  const [currentPath, setCurrentPath] = useState(homePath);

  // Update currentPath when user logs in if currently at root or undefined
  useEffect(() => {
    if (currentUser) {
      const newHome = currentUser === 'root' ? '/root' : `/home/${currentUser}`;
      setCurrentPath(newHome);
    }
  }, [currentUser]);

  const userObj = getCurrentUser(currentUser, users);

  const login = useCallback((username: string, password?: string) => {
    // 1. File Authority: Try to read /etc/passwd from current filesystem
    let targetUser: User | undefined;
    const etc = fileSystem.children?.find(c => c.name === 'etc');
    if (etc && etc.children) {
      const passwdFile = etc.children.find(c => c.name === 'passwd');
      if (passwdFile && passwdFile.content) {
        try {
          const fileUsers = parsePasswd(passwdFile.content);
          targetUser = fileUsers.find(u => u.username === username);
          // console.log('Auth: using /etc/passwd authority');
        } catch (e) {
          console.warn('Auth: /etc/passwd corrupted, falling back to memory');
        }
      }
    }

    // 2. Fallback: Memory
    if (!targetUser) {
      targetUser = users.find(u => u.username === username);
      // console.log('Auth: using memory fallback');
    }

    if (targetUser) {
      // Check password (if user has one set)
      if (targetUser.password && targetUser.password !== password) {
        notify.system('error', 'Auth', 'Incorrect password');
        return false;
      }
      setCurrentUser(username);
      notify.system('success', 'Auth', `Logged in as ${username}`);
      return true;
    } else {
      notify.system('error', 'Auth', 'User not found');
      return false;
    }
  }, [fileSystem, users]); // Depend on fileSystem to ensure fresh read

  const logout = useCallback(() => {
    setCurrentUser(null);
    notify.system('success', 'Auth', 'Logged out');
  }, []);

  // Persist users
  useEffect(() => {
    // console.log('Persisting users:', users);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // Sync users State -> Filesystem (/etc/passwd)
  useEffect(() => {
    const passwdContent = formatPasswd(users);

    setFileSystem(prevFS => {
      // Find /etc/passwd
      const newFS = deepCloneFileSystem(prevFS);
      const etc = newFS.children?.find(c => c.name === 'etc');
      if (etc && etc.children) {
        let passwd = etc.children.find(c => c.name === 'passwd');
        if (!passwd) {
          // create if missing?
          passwd = { id: crypto.randomUUID(), name: 'passwd', type: 'file', content: '', owner: 'root', permissions: '-rw-r--r--' };
          etc.children.push(passwd);
        }

        if (passwd.content !== passwdContent) {
          passwd.content = passwdContent;
          passwd.modified = new Date();
          return newFS; // Update state
        }
      }
      return prevFS; // No change needed
    });
  }, [users]);

  // Persist filesystem changes to localStorage (Debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveFileSystem(fileSystem);
    }, 1000); // 1000ms debounce

    return () => clearTimeout(timeoutId);
  }, [fileSystem]);

  // Resolve ~ and . and .. in paths
  const resolvePath = useCallback((path: string): string => {
    // Handle home shortcut
    let resolved = path.replace(/^~/, homePath);

    // Map top-level user directories for better UX (Desktop OS feel)
    const userDirs = ['Desktop', 'Documents', 'Downloads', 'Pictures', 'Music', 'Videos'];
    for (const dir of userDirs) {
      if (resolved.startsWith(`/${dir}`)) {
        resolved = resolved.replace(`/${dir}`, `${homePath}/${dir}`);
        break;
      }
    }

    // Handle relative paths
    if (!resolved.startsWith('/')) {
      resolved = currentPath + '/' + resolved;
    }

    // Normalize path (handle . and ..)
    const parts = resolved.split('/').filter(p => p && p !== '.');
    const stack: string[] = [];

    for (const part of parts) {
      if (part === '..') {
        stack.pop();
      } else {
        stack.push(part);
      }
    }

    return '/' + stack.join('/');
  }, [homePath, currentPath]);

  // Reset filesystem to initial state
  const resetFileSystem = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USERS_STORAGE_KEY);
    setFileSystem(deepCloneFileSystem(initialFileSystem));
    setUsers(DEFAULT_USERS);
    setCurrentUser(null); // Return to login screen
    notify.system('success', 'System', 'System reset to factory defaults');
  }, []);

  const getNodeAtPath = useCallback((path: string): FileNode | null => {
    const resolved = resolvePath(path);
    if (resolved === '/') return fileSystem;

    const parts = resolved.split('/').filter(p => p);
    let current: FileNode | null = fileSystem;

    for (const part of parts) {
      if (!current || current.type !== 'directory' || !current.children) {
        return null;
      }

      // Enforce Directory Execute (Traversal) Permission
      // In Linux, you need +x on a directory to access its children (traverse it)
      if (!checkPermissions(current, userObj, 'execute')) {
        // We fail silently here (like standard path resolution would effectively "not find" it due to permissions)
        // But effectively it blocks access. Operative functions will fail with null.
        return null;
      }

      current = current.children.find(child => child.name === part) || null;
    }

    return current;
  }, [fileSystem, resolvePath, userObj]);

  const listDirectory = useCallback((path: string): FileNode[] | null => {
    const node = getNodeAtPath(path); // This now implicitly checks traversal permissions on parents
    if (!node || node.type !== 'directory') return null;

    // Enforce Read Permission on the target directory itself
    if (!checkPermissions(node, userObj, 'read')) {
      notify.system('error', 'Permission Denied', `Cannot open directory ${node.name}: Permission denied`);
      return null;
    }

    return node.children || [];
  }, [getNodeAtPath, userObj]);

  const readFile = useCallback((path: string): string | null => {
    const node = getNodeAtPath(path); // Implicitly checks traversal
    if (!node || node.type !== 'file') return null;

    // Enforce Read Permission on file
    if (!checkPermissions(node, userObj, 'read')) {
      notify.system('error', 'Permission Denied', `Cannot read file ${node.name}: Permission denied`);
      return null;
    }

    return node.content || '';
  }, [getNodeAtPath, userObj]);

  const deleteNode = useCallback((path: string): boolean => {
    const resolved = resolvePath(path);
    if (resolved === '/') return false;

    const parts = resolved.split('/').filter(p => p);
    const name = parts.pop();
    if (!name) return false;

    // Permissions Check: Need write access to parent directory
    const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
    const parentNode = getNodeAtPath(parentPath);
    if (!parentNode) return false;

    // 1. Check basic Write permission on parent
    if (!checkPermissions(parentNode, userObj, 'write')) {
      notify.system('error', 'Permission Denied', `Cannot delete ${name}: Permission denied`);
      return false;
    }

    const targetNode = parentNode.children?.find(c => c.name === name);
    if (!targetNode) return false;

    // 2. Sticky Bit Check
    // If sticky bit is set (t/T at end), user can only delete if they own the FILE or the DIRECTORY
    const perms = parentNode.permissions || '';
    const isSticky = perms.endsWith('t') || perms.endsWith('T');

    if (isSticky) {
      const isOwnerOfFile = targetNode.owner === currentUser;
      const isOwnerOfParent = parentNode.owner === currentUser;

      if (!isOwnerOfFile && !isOwnerOfParent && currentUser !== 'root') {
        notify.system('error', 'Permission Denied', `Sticky bit constraint: You can only delete your own files in ${parentNode.name}`);
        return false;
      }
    }

    setFileSystem(prevFS => {
      const newFS = deepCloneFileSystem(prevFS);
      let parent = newFS;

      for (const part of parts) {
        if (parent.children) {
          parent = parent.children.find((child: FileNode) => child.name === part)!;
        }
      }

      if (parent && parent.children) {
        parent.children = parent.children.filter((child: FileNode) => child.name !== name);
      }

      return newFS;
    });

    return true;
  }, [resolvePath, getNodeAtPath, userObj, currentUser]);

  // Re-implemented moveNode with strict name check feature
  const moveNode = useCallback((fromPath: string, toPath: string): boolean => {
    const resolvedFrom = resolvePath(fromPath);
    const resolvedTo = resolvePath(toPath);

    const node = getNodeAtPath(resolvedFrom);
    if (!node) return false;

    // Check permissions
    // 1. Source Parent (Write)
    const sourceParentPath = resolvedFrom.substring(0, resolvedFrom.lastIndexOf('/')) || '/';
    const sourceParent = getNodeAtPath(sourceParentPath);
    if (!sourceParent || !checkPermissions(sourceParent, userObj, 'write')) {
      notify.system('error', 'Permission Denied', `Cannot move from ${sourceParentPath}`);
      return false;
    }

    // Clone the node to move
    const nodeToMove = deepCloneFileNode(node);

    // Get parent directory of destination
    const toParts = resolvedTo.split('/').filter(p => p);
    const newName = toParts.pop();
    const parentPath = '/' + toParts.join('/');

    if (!newName) return false;

    const destParent = getNodeAtPath(parentPath);
    if (!destParent || destParent.type !== 'directory' || !destParent.children) return false;

    // 2. Dest Parent (Write)
    if (!checkPermissions(destParent, userObj, 'write')) {
      notify.system('error', 'Permission Denied', `Cannot move to ${parentPath}`);
      return false;
    }

    // Check for collision at destination
    if (destParent.children.some(child => child.name === newName)) {
      return false;
    }

    // Delete from original location
    const deleteSuccess = deleteNode(resolvedFrom);
    if (!deleteSuccess) return false;

    // Update name if moving to different location
    nodeToMove.name = newName;

    // Add to new location
    setFileSystem(prevFS => {
      const newFS = deepCloneFileSystem(prevFS);
      const parts = parentPath.split('/').filter(p => p);
      let current = newFS;

      for (const part of parts) {
        if (current.children) {
          current = current.children.find(child => child.name === part)!;
        }
      }

      if (current && current.children) {
        current.children.push(nodeToMove);
      }

      return newFS;
    });

    return true;
  }, [getNodeAtPath, deleteNode, resolvePath, userObj]);

  const moveNodeById = useCallback((id: string, destParentPath: string): boolean => {
    // 1. Find the source node and its parent using ID
    const result = findNodeAndParent(fileSystem, id);
    if (!result) return false;

    const { node: nodeToMove, parent: sourceParent } = result;
    const destParent = getNodeAtPath(resolvePath(destParentPath));

    // Permission Check 1: Source Parent (Write)
    // We need to check if the current user can write to the source parent to remove the node
    if (!checkPermissions(sourceParent, userObj, 'write')) {
      notify.system('error', 'Permission Denied', `Cannot move from ${sourceParent.name}`);
      return false;
    }

    // 2. Validate destination
    if (!destParent || destParent.type !== 'directory' || !destParent.children) return false;

    // Permission Check 2: Destination Parent (Write)
    if (!checkPermissions(destParent, userObj, 'write')) {
      notify.system('error', 'Permission Denied', `Cannot move to ${destParent.name}`);
      return false;
    }

    // Safety Checks: Prevent recursive moves

    // Safety Checks: Prevent recursive moves
    if (nodeToMove.id === destParent.id) {
      notify.system('error', 'FileSystem', 'Operation blocked: Cannot move a directory into itself');
      return false;
    }
    if (isDescendant(nodeToMove, destParent.id)) {
      notify.system('error', 'FileSystem', 'Operation blocked: Cannot move a directory into its own descendant');
      return false;
    }

    // 3. Collision Check: Don't overwrite existing name at destination
    if (destParent.children.some(child => child.name === nodeToMove.name)) {
      return false;
    }

    // Permissions are now checked above.

    // 4. Perform Move
    setFileSystem(prevFS => {
      const newFS = deepCloneFileSystem(prevFS);

      const findInClone = (root: FileNode): { node: FileNode, parent: FileNode } | null => {
        if (root.children) {
          for (const child of root.children) {
            if (child.id === id) return { node: child, parent: root };
            if (child.type === 'directory') {
              const res = findInClone(child);
              if (res) return res;
            }
          }
        }
        return null;
      };

      const sourceRes = findInClone(newFS);
      if (!sourceRes) return newFS;

      const { node: cloneNode, parent: cloneSourceParent } = sourceRes;

      const destResolved = resolvePath(destParentPath);
      const destParts = destResolved.split('/').filter(p => p);
      let cloneDestParent = newFS;
      for (const part of destParts) {
        if (cloneDestParent.children) {
          const found = cloneDestParent.children.find(c => c.name === part);
          if (found) cloneDestParent = found;
        }
      }

      if (!cloneDestParent.children) return newFS;

      cloneSourceParent.children = cloneSourceParent.children!.filter(c => c.id !== id);
      cloneDestParent.children.push(cloneNode);

      return newFS;
    });

    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileSystem, resolvePath, getNodeAtPath, findNodeAndParent]);

  const moveToTrash = useCallback((path: string): boolean => {
    const resolved = resolvePath(path);
    const trashPath = resolvePath('~/.Trash');

    // If already in trash, permanent delete
    if (resolved.startsWith(trashPath)) {
      return deleteNode(path);
    }

    const fileName = resolved.split('/').pop();
    if (!fileName) return false;

    // Handle collision
    let destPath = `${trashPath}/${fileName}`;
    let counter = 1;

    while (getNodeAtPath(destPath)) {
      const extIndex = fileName.lastIndexOf('.');
      if (extIndex > 0) {
        const name = fileName.substring(0, extIndex);
        const ext = fileName.substring(extIndex);
        destPath = `${trashPath}/${name} ${counter}${ext}`;
      } else {
        destPath = `${trashPath}/${fileName} ${counter}`;
      }
      counter++;
    }

    return moveNode(path, destPath);
  }, [resolvePath, getNodeAtPath, moveNode, deleteNode]);

  const emptyTrash = useCallback(() => {
    // Only allow if owner of Trash? usually yes.
    setFileSystem(prevFS => {
      const newFS = deepCloneFileSystem(prevFS);
      const trashPath = resolvePath('~/.Trash');

      const parts = trashPath.split('/').filter(p => p);
      let current = newFS;

      for (const part of parts) {
        if (current.children) {
          const found = current.children.find(c => c.name === part);
          if (found) current = found;
          else return newFS; // Trash not found?
        }
      }

      if (current && current.children) {
        current.children = [];
      }

      return newFS;
    });
  }, [resolvePath]);

  const createFile = useCallback((path: string, name: string, content: string = ''): boolean => {
    const resolved = resolvePath(path);
    const node = getNodeAtPath(resolved);
    if (!node || node.type !== 'directory' || !node.children) return false;

    // Permissions check
    if (!checkPermissions(node, userObj, 'write')) {
      notify.system('error', 'Permission Denied', `Cannot create file in ${resolved}`);
      return false;
    }

    // Check for existing node (file OR directory) with same name
    if (node.children.some(child => child.name === name)) {
      return false;
    }

    const newFile: FileNode = {
      id: crypto.randomUUID(),
      name,
      type: 'file',
      content,
      size: content.length,
      modified: new Date(),
      owner: currentUser || 'root',
      permissions: '-rw-r--r--',
    };

    setFileSystem(prevFS => {
      const newFS = deepCloneFileSystem(prevFS);
      const parts = resolved.split('/').filter(p => p);
      let current = newFS;

      for (const part of parts) {
        if (current.children) {
          current = current.children.find(child => child.name === part)!;
        }
      }

      if (current && current.children) {
        current.children.push(newFile);
      }
      return newFS;
    });

    return true;
  }, [getNodeAtPath, resolvePath, currentUser, userObj]);

  const createDirectory = useCallback((path: string, name: string): boolean => {
    const resolved = resolvePath(path);
    const node = getNodeAtPath(resolved);
    if (!node || node.type !== 'directory' || !node.children) return false;

    // Permissions check
    if (!checkPermissions(node, userObj, 'write')) {
      notify.system('error', 'Permission Denied', `Cannot create directory in ${resolved}`);
      return false;
    }

    // Check for existing node (file OR directory) with same name
    if (node.children.some(child => child.name === name)) {
      return false;
    }

    const newDir: FileNode = {
      id: crypto.randomUUID(),
      name,
      type: 'directory',
      children: [],
      modified: new Date(),
      owner: currentUser || 'root',
      permissions: 'drwxr-xr-x',
    };

    setFileSystem(prevFS => {
      const newFS = deepCloneFileSystem(prevFS);
      const parts = resolved.split('/').filter(p => p);
      let current = newFS;

      for (const part of parts) {
        if (current.children) {
          current = current.children.find(child => child.name === part)!;
        }
      }

      if (current && current.children) {
        current.children.push(newDir);
      }

      return newFS;
    });

    return true;
  }, [getNodeAtPath, resolvePath, currentUser, userObj]);

  // Hook into writeFile to detect /etc/passwd changes (File -> State)
  const writeFile = useCallback((path: string, content: string): boolean => {
    const resolved = resolvePath(path);
    const node = getNodeAtPath(resolved);

    // Check modify permission on file itself if it exists
    if (node) {
      if (!checkPermissions(node, userObj, 'write')) {
        notify.system('error', 'Permission Denied', `Cannot write to ${resolved}`);
        return false;
      }
    }

    // Original write logic
    setFileSystem(prevFS => {
      const newFS = deepCloneFileSystem(prevFS);
      const parts = resolved.split('/').filter(p => p);
      let current = newFS;

      for (let i = 0; i < parts.length - 1; i++) {
        if (current.children) {
          current = current.children.find((child: FileNode) => child.name === parts[i])!;
        }
      }

      if (current && current.children) {
        const file = current.children.find((child: FileNode) => child.name === parts[parts.length - 1]);
        if (file && file.type === 'file') {
          file.content = content;
          file.size = content.length;
          file.modified = new Date();
        }
      }

      return newFS;
    });

    // Check if we wrote to /etc/passwd
    if (resolved === '/etc/passwd') {
      try {
        const parsedUsers = parsePasswd(content);
        // Detect if content actually changed in a meaningful way
        if (JSON.stringify(parsedUsers) !== JSON.stringify(users)) {
          setUsers(parsedUsers);
        }
      } catch (e) {
        console.error('Failed to parse /etc/passwd update:', e);
      }
    }

    return true;
  }, [resolvePath, users, getNodeAtPath, userObj]);

  const addUser = useCallback((username: string, fullName: string, password?: string): boolean => {
    console.log('Adding user:', username);
    if (users.some(u => u.username === username)) return false;

    const maxUid = Math.max(...users.map(u => u.uid));
    const newUid = maxUid < 1000 ? 1000 : maxUid + 1;

    const newUser: User = {
      username,
      password: password || 'x',
      uid: newUid,
      gid: newUid,
      fullName,
      homeDir: `/home/${username}`,
      shell: '/bin/bash'
    };

    setUsers(prev => [...prev, newUser]);

    // Create populated home directory
    const homeNode = ensureIds(createUserHome(username));

    setFileSystem(prevFS => {
      const newFS = deepCloneFileSystem(prevFS);
      // Navigate to /home
      let homeDir = newFS.children?.find(c => c.name === 'home');

      // Safety check: ensure /home exists
      if (!homeDir) {
        // Create /home if it doesn't exist (unlikely but safe)
        homeDir = {
          id: crypto.randomUUID(),
          name: 'home',
          type: 'directory',
          children: [],
          owner: 'root',
          permissions: 'drwxr-xr-x'
        };
        if (newFS.children) newFS.children.push(homeDir);
        else newFS.children = [homeDir];
      }

      if (homeDir && homeDir.children) {
        // Check if directory already exists
        if (!homeDir.children.some(c => c.name === username)) {
          homeDir.children.push(homeNode);
        }
      }

      return newFS;
    });

    return true;
  }, [users]);

  const deleteUser = useCallback((username: string): boolean => {
    if (username === 'root' || username === 'user') {
      notify.system('error', 'User Management', 'Cannot delete default system users');
      return false;
    }
    const target = users.find(u => u.username === username);
    if (!target) return false;

    setUsers(prev => prev.filter(u => u.username !== username));

    return true;
  }, [users]);

  return (
    <FileSystemContext.Provider
      value={{
        fileSystem,
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
        logout
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystem() {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within FileSystemProvider');
  }
  return context;
}
