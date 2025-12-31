import { useCallback } from 'react';
import {
    FileNode,
    checkPermissions,
    deepCloneFileSystem,
    deepCloneFileNode,
    findNodeAndParent,
    isDescendant,
    octalToPermissions,
    User,
    Group,
    parsePasswd,
    parseGroup,
    parseSymbolicMode
} from '../../utils/fileSystemUtils';
import { notify } from '../../services/notifications';

interface UseFileSystemMutationsProps {
    fileSystem: FileNode;
    setFileSystem: React.Dispatch<React.SetStateAction<FileNode>>;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    groups: Group[];
    setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
    currentUser: string | null;
    getCurrentUser: (username: string | null) => User;
    resolvePath: (path: string) => string;
    getNodeAtPath: (path: string, asUser?: string) => FileNode | null;
}

export function useFileSystemMutations({
    setFileSystem,
    users,
    setUsers,
    groups,
    setGroups,
    currentUser,
    getCurrentUser,
    resolvePath,
    getNodeAtPath,
    fileSystem
}: UseFileSystemMutationsProps) {

    const userObj = getCurrentUser(currentUser);

    const deleteNode = useCallback((path: string, asUser?: string): boolean => {
        const resolved = resolvePath(path);
        if (resolved === '/') return false;
        const parts = resolved.split('/').filter(p => p);
        const name = parts.pop();
        if (!name) return false;
        const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
        const parentNode = getNodeAtPath(parentPath, asUser);
        const actingUser = asUser ? users.find(u => u.username === asUser) || userObj : userObj;
        const effectiveUsername = actingUser.username;

        if (!parentNode) return false;
        if (!checkPermissions(parentNode, actingUser, 'write')) return false;

        const targetNode = parentNode.children?.find(c => c.name === name);
        if (!targetNode) return false;

        const perms = parentNode.permissions || '';
        const isSticky = perms.endsWith('t') || perms.endsWith('T');
        if (isSticky) {
            const isOwnerOfFile = targetNode.owner === effectiveUsername;
            const isOwnerOfParent = parentNode.owner === effectiveUsername;
            if (!isOwnerOfFile && !isOwnerOfParent && effectiveUsername !== 'root') {
                notify.system('error', 'Permission Denied', `Sticky bit constraint: You can only delete your own files in ${parentNode.name}`);
                return false;
            }
        }
        setFileSystem(prevFS => {
            const newFS = deepCloneFileSystem(prevFS);
            let parent = newFS;
            for (const part of parts) {
                if (parent.children) parent = parent.children.find((child: FileNode) => child.name === part)!;
            }
            if (parent && parent.children) parent.children = parent.children.filter((child: FileNode) => child.name !== name);
            return newFS;
        });
        return true;
    }, [resolvePath, getNodeAtPath, userObj, users, setFileSystem]);

    // Forward declaration of moveNode for moveToTrash dependencies
    const moveNode = useCallback((fromPath: string, toPath: string, asUser?: string): boolean => {
        const resolvedFrom = resolvePath(fromPath);
        const resolvedTo = resolvePath(toPath);
        const actingUser = asUser ? users.find(u => u.username === asUser) || userObj : userObj;

        const node = getNodeAtPath(resolvedFrom, asUser);
        if (!node) return false;
        const sourceParentPath = resolvedFrom.substring(0, resolvedFrom.lastIndexOf('/')) || '/';
        const sourceParent = getNodeAtPath(sourceParentPath, asUser);
        if (!sourceParent || !checkPermissions(sourceParent, actingUser, 'write')) return false;

        const nodeToMove = deepCloneFileNode(node);
        const toParts = resolvedTo.split('/').filter(p => p);
        const newName = toParts.pop();
        const parentPath = '/' + toParts.join('/');
        if (!newName) return false;

        const destParent = getNodeAtPath(parentPath, asUser);
        if (!destParent || destParent.type !== 'directory' || !destParent.children) return false;
        if (!checkPermissions(destParent, actingUser, 'write')) return false;

        if (destParent.children.some(child => child.name === newName)) return false;

        // We can't reuse deleteNode here directly if we want atomic operation inside one setFileSystem?
        // Actually moveNode implementation in original code calls deleteNode() which commits via setFileSystem.
        // Then it commits the addition. This is NOT atomic but that's how it was.
        // We will keep it non-atomic for now to match behavior and reuse logic.
        // Wait, deleteNode calls setFileSystem. So we are doing multiple state updates.
        // It's better to implement atomic move if possible, but let's stick to existing behavior first.

        const deleteSuccess = deleteNode(resolvedFrom, asUser);
        if (!deleteSuccess) return false;

        nodeToMove.name = newName;
        setFileSystem(prevFS => {
            const newFS = deepCloneFileSystem(prevFS);
            const parts = parentPath.split('/').filter(p => p);
            let current = newFS;
            for (const part of parts) {
                if (current.children) current = current.children.find(child => child.name === part)!;
            }
            if (current && current.children) current.children.push(nodeToMove);
            return newFS;
        });
        return true;
    }, [getNodeAtPath, deleteNode, resolvePath, userObj, users, setFileSystem]);

    const moveToTrash = useCallback((path: string, asUser?: string): boolean => {
        const resolved = resolvePath(path);
        const trashPath = resolvePath('~/.Trash');
        if (resolved.startsWith(trashPath)) return deleteNode(path, asUser);
        const fileName = resolved.split('/').pop();
        if (!fileName) return false;
        let destPath = `${trashPath}/${fileName}`;
        let counter = 1;
        while (getNodeAtPath(destPath, asUser)) {
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
        return moveNode(path, destPath, asUser);
    }, [resolvePath, getNodeAtPath, moveNode, deleteNode]);

    const moveNodeById = useCallback((id: string, destParentPath: string, asUser?: string): boolean => {
        const result = findNodeAndParent(fileSystem, id);
        if (!result) return false;
        const { node: nodeToMove, parent: sourceParent } = result;
        const destParent = getNodeAtPath(resolvePath(destParentPath), asUser);
        const actingUser = asUser ? users.find(u => u.username === asUser) || userObj : userObj;

        if (!checkPermissions(sourceParent, actingUser, 'write')) {
            notify.system('error', 'Permission Denied', `Cannot move from ${sourceParent.name}`);
            return false;
        }
        if (!destParent || destParent.type !== 'directory' || !destParent.children) return false;
        if (!checkPermissions(destParent, actingUser, 'write')) {
            notify.system('error', 'Permission Denied', `Cannot move to ${destParent.name}`);
            return false;
        }
        if (nodeToMove.id === destParent.id) return false;
        if (isDescendant(nodeToMove, destParent.id)) return false;
        if (destParent.children.some(child => child.name === nodeToMove.name)) return false;

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
    }, [fileSystem, resolvePath, getNodeAtPath, userObj, users, setFileSystem]);

    const emptyTrash = useCallback(() => {
        setFileSystem(prevFS => {
            const newFS = deepCloneFileSystem(prevFS);
            const trashPath = resolvePath('~/.Trash');
            const parts = trashPath.split('/').filter(p => p);
            let current = newFS;
            for (const part of parts) {
                if (current.children) {
                    const found = current.children.find(c => c.name === part);
                    if (found) current = found;
                    else return newFS;
                }
            }
            if (current && current.children) current.children = [];
            return newFS;
        });
    }, [resolvePath, setFileSystem]);

    const createFile = useCallback((path: string, name: string, content: string = '', asUser?: string): boolean => {
        const resolved = resolvePath(path);
        const node = getNodeAtPath(resolved, asUser);
        const actingUser = asUser ? users.find(u => u.username === asUser) || userObj : userObj;

        if (!node || node.type !== 'directory' || !node.children) return false;
        if (!checkPermissions(node, actingUser, 'write')) return false;
        if (node.children.some(child => child.name === name)) return false;

        const newFile: FileNode = {
            id: crypto.randomUUID(),
            name,
            type: 'file',
            content,
            size: content.length,
            modified: new Date(),
            owner: actingUser.username,
            permissions: '-rw-r--r--',
        };
        setFileSystem(prevFS => {
            const newFS = deepCloneFileSystem(prevFS);
            const parts = resolved.split('/').filter(p => p);
            let current = newFS;
            for (const part of parts) {
                if (current.children) current = current.children.find(child => child.name === part)!;
            }
            if (current && current.children) current.children.push(newFile);
            return newFS;
        });
        return true;
    }, [getNodeAtPath, resolvePath, userObj, users, setFileSystem]);

    const createDirectory = useCallback((path: string, name: string, asUser?: string): boolean => {
        const resolved = resolvePath(path);
        const node = getNodeAtPath(resolved, asUser);
        const actingUser = asUser ? users.find(u => u.username === asUser) || userObj : userObj;

        if (!node || node.type !== 'directory' || !node.children) return false;
        if (!checkPermissions(node, actingUser, 'write')) return false;
        if (node.children.some(child => child.name === name)) return false;

        const newDir: FileNode = {
            id: crypto.randomUUID(),
            name,
            type: 'directory',
            children: [],
            modified: new Date(),
            owner: actingUser.username,
            permissions: 'drwxr-xr-x',
        };
        setFileSystem(prevFS => {
            const newFS = deepCloneFileSystem(prevFS);
            const parts = resolved.split('/').filter(p => p);
            let current = newFS;
            for (const part of parts) {
                if (current.children) current = current.children.find(child => child.name === part)!;
            }
            if (current && current.children) current.children.push(newDir);
            return newFS;
        });
        return true;
    }, [getNodeAtPath, resolvePath, userObj, users, setFileSystem]);

    const writeFile = useCallback((path: string, content: string, asUser?: string): boolean => {
        const resolved = resolvePath(path);
        const node = getNodeAtPath(resolved, asUser);
        const actingUser = asUser ? users.find(u => u.username === asUser) || userObj : userObj;

        // FIX: If file doesn't exist, we can't update it -> return false so caller can create it
        if (!node) return false;

        if (node) {
            if (!checkPermissions(node, actingUser, 'write')) return false;
        }

        setFileSystem(prevFS => {
            const newFS = deepCloneFileSystem(prevFS);
            const parts = resolved.split('/').filter(p => p);
            let current = newFS;
            for (let i = 0; i < parts.length - 1; i++) {
                if (current.children) current = current.children.find((child: FileNode) => child.name === parts[i])!;
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

        if (resolved === '/etc/passwd') {
            try {
                const parsedUsers = parsePasswd(content);
                if (JSON.stringify(parsedUsers) !== JSON.stringify(users)) setUsers(parsedUsers);
            } catch (e) {
                console.error('Failed to parse /etc/passwd update:', e);
            }
        }
        if (resolved === '/etc/group') {
            try {
                const parsedGroups = parseGroup(content);
                if (JSON.stringify(parsedGroups) !== JSON.stringify(groups)) setGroups(parsedGroups);
            } catch (e) {
                console.error('Failed to parse /etc/group update:', e);
            }
        }

        return true;
    }, [resolvePath, users, groups, getNodeAtPath, userObj, setFileSystem, setUsers, setGroups]);

    const chmod = useCallback((path: string, mode: string, asUser?: string): boolean => {
        const resolved = resolvePath(path);
        const node = getNodeAtPath(resolved, asUser);
        const actingUser = asUser ? users.find(u => u.username === asUser) || userObj : userObj;

        if (!node) return false;
        if (actingUser.username !== 'root' && node.owner !== actingUser.username) return false;

        let newPerms = node.permissions || (node.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--');
        if (/^[0-7]{3}$/.test(mode)) {
            newPerms = octalToPermissions(mode, node.type);
        } else if (mode.length === 10) {
            newPerms = mode;
        } else {
            // Try symbolic
            const symbolic = parseSymbolicMode(newPerms, mode);
            if (symbolic) {
                newPerms = symbolic;
            } else {
                return false;
            }
        }

        setFileSystem(prevFS => {
            const newFS = deepCloneFileSystem(prevFS);
            const parts = resolved.split('/').filter(p => p);
            let current = newFS;
            for (const part of parts) {
                if (current.children) current = current.children.find(child => child.name === part)!;
            }
            if (current) current.permissions = newPerms;
            return newFS;
        });

        return true;
    }, [resolvePath, getNodeAtPath, userObj, users, setFileSystem]);

    const chown = useCallback((path: string, owner: string, group?: string, asUser?: string): boolean => {
        const resolved = resolvePath(path);
        const node = getNodeAtPath(resolved, asUser);
        const actingUser = asUser ? users.find(u => u.username === asUser) || userObj : userObj;

        if (!node) return false;
        if (actingUser.username !== 'root') return false;

        setFileSystem(prevFS => {
            const newFS = deepCloneFileSystem(prevFS);
            const parts = resolved.split('/').filter(p => p);
            let current = newFS;
            for (const part of parts) {
                if (current.children) current = current.children.find(child => child.name === part)!;
            }
            if (current) {
                if (owner) current.owner = owner;
                if (group) current.group = group;
            }
            return newFS;
        });
        return true;
    }, [resolvePath, getNodeAtPath, userObj, users, setFileSystem]);

    return {
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
    };
}
