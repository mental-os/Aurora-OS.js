/**
 * Pure FileSystem Operations
 *
 * This module contains all the core domain logic for the Virtual File System.
 * These are pure functions (or as pure as possible) that take the current VFS state
 * and return either query results or modified VFS trees.
 *
 * They have ZERO React dependencies, allowing them to be shared seamlessly between:
 * 1. The player's React ecosystem (`useFileSystemQueries`, `useFileSystemMutations`)
 * 2. The NPC headless environments (`npcFileSystem.ts`)
 */

import {
    FileNode,
    User,
    Group,
    checkPermissions,
    deepCloneFileSystem,
    deepCloneFileNode,
    findNodeAndParent,
    isDescendant,
    octalToPermissions,
    parsePasswd,
    parseGroup,
    parseSymbolicMode
} from './fileSystemUtils';

// ─────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────

export function resolvePathFn(
    path: string,
    currentPath: string,
    homePath: string,
    users: User[],
    asUser?: string
): string {
    let userHome = homePath;
    if (asUser) {
        const actingUserObj = users.find(u => u.username === asUser);
        if (actingUserObj) {
            userHome = actingUserObj.homeDir;
        }
    }

    let resolved = path.replace(/^~/, userHome);
    const userDirs = ['Desktop', 'Documents', 'Downloads', 'Pictures', 'Music'];
    for (const dir of userDirs) {
        if (resolved.startsWith(`/${dir}`)) {
            resolved = resolved.replace(`/${dir}`, `${userHome}/${dir}`);
            break;
        }
    }
    
    if (!resolved.startsWith('/')) {
        resolved = currentPath + '/' + resolved;
    }
    
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
}

export function getNodeAtPathFn(
    fileSystem: FileNode,
    resolvedPath: string,
    actingUser: User
): FileNode | null {
    if (resolvedPath === '/') return fileSystem;
    const parts = resolvedPath.split('/').filter(p => p);
    let current: FileNode | null = fileSystem;

    for (const part of parts) {
        if (!current || current.type !== 'directory' || !current.children) return null;
        if (!checkPermissions(current, actingUser, 'execute')) return null;
        current = current.children.find(child => child.name === part) || null;
    }
    return current;
}

export function listDirectoryFn(
    fileSystem: FileNode,
    resolvedPath: string,
    actingUser: User
): FileNode[] | null {
    const node = getNodeAtPathFn(fileSystem, resolvedPath, actingUser);
    if (!node || node.type !== 'directory') return null;
    if (!checkPermissions(node, actingUser, 'read')) return null;
    return node.children || [];
}

export function readFileFn(
    fileSystem: FileNode,
    resolvedPath: string,
    actingUser: User
): string | null {
    const node = getNodeAtPathFn(fileSystem, resolvedPath, actingUser);
    if (!node || node.type !== 'file') return null;
    if (!checkPermissions(node, actingUser, 'read')) return null;
    return node.content || '';
}

// ─────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────

export function walkToNode(clonedRoot: FileNode, resolvedPath: string): FileNode | null {
    if (resolvedPath === '/') return clonedRoot;
    const parts = resolvedPath.split('/').filter(p => p);
    let cur: FileNode = clonedRoot;
    for (const part of parts) {
        const next = cur.children?.find(c => c.name === part);
        if (!next) return null;
        cur = next;
    }
    return cur;
}

// ─────────────────────────────────────────────────────────
// MUTATIONS (Return new FileSystem tree or null if rejected)
// ─────────────────────────────────────────────────────────

export function deleteNodeOp(
    fileSystem: FileNode,
    resolvedPath: string,
    actingUser: User
): { newFs: FileNode, error?: string } | null {
    if (resolvedPath === '/') return null;
    
    const parentPath = resolvedPath.substring(0, resolvedPath.lastIndexOf('/')) || '/';
    const name = resolvedPath.split('/').pop();
    if (!name) return null;

    const parentNode = getNodeAtPathFn(fileSystem, parentPath, actingUser);
    if (!parentNode || !checkPermissions(parentNode, actingUser, 'write')) return null;

    const targetNode = parentNode.children?.find(c => c.name === name);
    if (!targetNode) return null;

    // Sticky bit check
    const perms = parentNode.permissions || '';
    const isSticky = perms.endsWith('t') || perms.endsWith('T');
    if (isSticky) {
        const isOwnerOfFile = targetNode.owner === actingUser.username;
        const isOwnerOfParent = parentNode.owner === actingUser.username;
        if (!isOwnerOfFile && !isOwnerOfParent && actingUser.username !== 'root') {
            return { newFs: fileSystem, error: `Sticky bit constraint: You can only delete your own files in ${parentNode.name}` };
        }
    }

    const newFs = deepCloneFileSystem(fileSystem);
    const parentInClone = walkToNode(newFs, parentPath);
    if (parentInClone && parentInClone.children) {
        parentInClone.children = parentInClone.children.filter(c => c.name !== name);
    }
    
    return { newFs };
}

export function moveNodeOp(
    fileSystem: FileNode,
    resolvedFrom: string,
    resolvedTo: string,
    actingUser: User
): { newFs: FileNode, error?: string } | null {
    const sourceNode = getNodeAtPathFn(fileSystem, resolvedFrom, actingUser);
    if (!sourceNode) return null;

    const sourceParentPath = resolvedFrom.substring(0, resolvedFrom.lastIndexOf('/')) || '/';
    const sourceParent = getNodeAtPathFn(fileSystem, sourceParentPath, actingUser);
    if (!sourceParent || !checkPermissions(sourceParent, actingUser, 'write')) return null;

    const toParts = resolvedTo.split('/').filter(p => p);
    const newName = toParts.pop();
    const destParentPath = '/' + toParts.join('/');
    if (!newName) return null;

    const destParent = getNodeAtPathFn(fileSystem, destParentPath, actingUser);
    if (!destParent || destParent.type !== 'directory' || !destParent.children) return null;
    if (!checkPermissions(destParent, actingUser, 'write')) return null;

    if (destParent.children.some(c => c.name === newName)) return null;

    // Sticky bit check for source deletion
    const perms = sourceParent.permissions || '';
    const isSticky = perms.endsWith('t') || perms.endsWith('T');
    if (isSticky) {
        const isOwnerOfFile = sourceNode.owner === actingUser.username;
        const isOwnerOfParent = sourceParent.owner === actingUser.username;
        if (!isOwnerOfFile && !isOwnerOfParent && actingUser.username !== 'root') {
             return { newFs: fileSystem, error: `Sticky bit constraint: You can only move your own files in ${sourceParent.name}` };
        }
    }

    // Atomic clone
    const newFs = deepCloneFileSystem(fileSystem);
    
    // Remove from source
    const sourceParentClone = walkToNode(newFs, sourceParentPath);
    if (!sourceParentClone?.children) return null;
    const nodeClone = sourceParentClone.children.find(c => c.name === sourceNode.name);
    if (!nodeClone) return null;
    sourceParentClone.children = sourceParentClone.children.filter(c => c.name !== sourceNode.name);

    // Insert at dest
    nodeClone.name = newName;
    nodeClone.modified = new Date();
    const destParentClone = walkToNode(newFs, destParentPath);
    if (!destParentClone?.children) return null;
    destParentClone.children.push(nodeClone);

    return { newFs };
}

export function moveToTrashOp(
    fileSystem: FileNode,
    resolvedPath: string,
    actingUser: User
): { newFs: FileNode, error?: string } | null {
    const trashBasePath = actingUser.username === 'root' ? '/root/.Trash' : `/home/${actingUser.username}/.Trash`;
    
    if (resolvedPath.startsWith(trashBasePath)) {
        return deleteNodeOp(fileSystem, resolvedPath, actingUser);
    }
    
    const fileName = resolvedPath.split('/').pop();
    if (!fileName) return null;
    
    let destPath = `${trashBasePath}/${fileName}`;
    let counter = 1;
    
    while (getNodeAtPathFn(fileSystem, destPath, actingUser)) {
        const extIndex = fileName.lastIndexOf('.');
        if (extIndex > 0) {
            const name = fileName.substring(0, extIndex);
            const ext = fileName.substring(extIndex);
            destPath = `${trashBasePath}/${name} ${counter}${ext}`;
        } else {
            destPath = `${trashBasePath}/${fileName} ${counter}`;
        }
        counter++;
    }
    
    return moveNodeOp(fileSystem, resolvedPath, destPath, actingUser);
}

export function moveNodeByIdOp(
    fileSystem: FileNode,
    id: string,
    resolvedDest: string,
    actingUser: User,
    sourceActingUser: User
): { newFs: FileNode, error?: string } | null {
    const result = findNodeAndParent(fileSystem, id);
    if (!result) return null;
    const { node: nodeToMove, parent: sourceParent } = result;

    if (!checkPermissions(sourceParent, sourceActingUser, 'write')) {
        return { newFs: fileSystem, error: `Cannot move from ${sourceParent.name} (as ${sourceActingUser.username})` };
    }

    const destParent = getNodeAtPathFn(fileSystem, resolvedDest, actingUser);
    if (!destParent || destParent.type !== 'directory' || !destParent.children) return null;
    if (!checkPermissions(destParent, actingUser, 'write')) {
        return { newFs: fileSystem, error: `Cannot move to ${destParent.name}` };
    }

    if (nodeToMove.id === destParent.id) return null;
    if (isDescendant(nodeToMove, destParent.id)) return null;
    if (destParent.children.some(child => child.name === nodeToMove.name)) return null;

    const newFs = deepCloneFileSystem(fileSystem);
    
    // Find in clone & detach
    const sourceRes = findNodeAndParent(newFs, id);
    if (!sourceRes || !sourceRes.parent.children) return null;
    sourceRes.parent.children = sourceRes.parent.children.filter(c => c.id !== id);

    // Attach to dest
    const destClone = walkToNode(newFs, resolvedDest);
    if (!destClone?.children) return null;
    destClone.children.push(sourceRes.node);

    return { newFs };
}

export function copyNodeByIdOp(
    fileSystem: FileNode,
    id: string,
    resolvedDest: string,
    actingUser: User,
    sourceActingUser: User
): { newFs: FileNode, error?: string } | null {
    const result = findNodeAndParent(fileSystem, id);
    if (!result) return null;
    const { node: sourceNode } = result;

    if (!checkPermissions(sourceNode, sourceActingUser, 'read')) {
        return { newFs: fileSystem, error: `Cannot copy ${sourceNode.name} (read denied)` };
    }

    const destParent = getNodeAtPathFn(fileSystem, resolvedDest, actingUser);
    if (!destParent || destParent.type !== 'directory' || !destParent.children) return null;
    if (!checkPermissions(destParent, actingUser, 'write')) {
        return { newFs: fileSystem, error: `Cannot paste to ${destParent.name} (write denied)` };
    }

    let newName = sourceNode.name;
    let counter = 1;
    while (destParent.children.some(c => c.name === newName)) {
        const extIndex = sourceNode.name.lastIndexOf('.');
        if (extIndex > 0 && sourceNode.type === 'file') {
             const name = sourceNode.name.substring(0, extIndex);
             const ext = sourceNode.name.substring(extIndex);
             newName = `${name} copy ${counter}${ext}`;
        } else {
             newName = `${sourceNode.name} copy ${counter}`;
        }
        counter++;
    }

    const cloneNodeRecursive = (node: FileNode, owner: string): FileNode => {
        const newNode = deepCloneFileNode(node);
        newNode.id = crypto.randomUUID();
        newNode.owner = owner;
        newNode.modified = new Date();
        if (newNode.children) {
            newNode.children = newNode.children.map(child => cloneNodeRecursive(child, owner));
        }
        return newNode;
    };

    const clonedNode = cloneNodeRecursive(sourceNode, actingUser.username);
    clonedNode.name = newName;

    const newFs = deepCloneFileSystem(fileSystem);
    const destClone = walkToNode(newFs, resolvedDest);
    if (!destClone?.children) return null;
    destClone.children.push(clonedNode);

    return { newFs };
}

export function emptyTrashOp(
    fileSystem: FileNode,
    resolvedTrashPath: string
): { newFs: FileNode } {
    const newFs = deepCloneFileSystem(fileSystem);
    const trashClone = walkToNode(newFs, resolvedTrashPath);
    if (trashClone && trashClone.children) {
        trashClone.children = [];
    }
    return { newFs };
}

export function createFileOp(
    fileSystem: FileNode,
    resolvedPath: string,
    name: string,
    content: string,
    actingUser: User,
    permissions: string = '-rw-r--r--'
): { newFs: FileNode } | null {
    const node = getNodeAtPathFn(fileSystem, resolvedPath, actingUser);
    if (!node || node.type !== 'directory' || !node.children) return null;
    if (!checkPermissions(node, actingUser, 'write')) return null;
    if (node.children.some(child => child.name === name)) return null;

    const newFile: FileNode = {
        id: crypto.randomUUID(),
        name,
        type: 'file',
        content,
        size: content.length,
        modified: new Date(),
        owner: actingUser.username,
        permissions: permissions,
    };

    const newFs = deepCloneFileSystem(fileSystem);
    const parentClone = walkToNode(newFs, resolvedPath);
    if (!parentClone?.children) return null;
    parentClone.children.push(newFile);
    return { newFs };
}

export function createDirectoryOp(
    fileSystem: FileNode,
    resolvedPath: string,
    name: string,
    actingUser: User
): { newFs: FileNode } | null {
    const node = getNodeAtPathFn(fileSystem, resolvedPath, actingUser);
    if (!node || node.type !== 'directory' || !node.children) return null;
    if (!checkPermissions(node, actingUser, 'write')) return null;
    if (node.children.some(child => child.name === name)) return null;

    const newDir: FileNode = {
        id: crypto.randomUUID(),
        name,
        type: 'directory',
        children: [],
        modified: new Date(),
        owner: actingUser.username,
        permissions: 'drwxr-xr-x',
    };

    const newFs = deepCloneFileSystem(fileSystem);
    const parentClone = walkToNode(newFs, resolvedPath);
    if (!parentClone?.children) return null;
    parentClone.children.push(newDir);
    return { newFs };
}

export interface WriteFileResult {
    newFs: FileNode;
    newUsers?: User[];
    newGroups?: Group[];
}

export function writeFileOp(
    fileSystem: FileNode,
    resolvedPath: string,
    content: string,
    actingUser: User,
    currentUsers: User[],
    currentGroups: Group[]
): WriteFileResult | null {
    const node = getNodeAtPathFn(fileSystem, resolvedPath, actingUser);
    if (!node) return null; // Caller must create if it doesn't exist
    if (node.type !== 'file' || !checkPermissions(node, actingUser, 'write')) return null;

    const newFs = deepCloneFileSystem(fileSystem);
    const fileClone = walkToNode(newFs, resolvedPath);
    if (!fileClone || fileClone.type !== 'file') return null;
    
    fileClone.content = content;
    fileClone.size = content.length;
    fileClone.modified = new Date();

    const result: WriteFileResult = { newFs };

    if (resolvedPath === '/etc/passwd') {
        try {
            const parsedUsers = parsePasswd(content);
            if (JSON.stringify(parsedUsers) !== JSON.stringify(currentUsers)) {
                result.newUsers = parsedUsers;
            }
        } catch { /* malformed */ }
    }
    
    if (resolvedPath === '/etc/group') {
        try {
            const parsedGroups = parseGroup(content);
            if (JSON.stringify(parsedGroups) !== JSON.stringify(currentGroups)) {
                result.newGroups = parsedGroups;
            }
        } catch { /* malformed */ }
    }

    return result;
}

export function chmodOp(
    fileSystem: FileNode,
    resolvedPath: string,
    mode: string,
    actingUser: User
): { newFs: FileNode } | null {
    const node = getNodeAtPathFn(fileSystem, resolvedPath, actingUser);
    if (!node) return null;
    if (actingUser.username !== 'root' && node.owner !== actingUser.username) return null;

    let newPerms = node.permissions || (node.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--');
    if (/^[0-7]{3}$/.test(mode)) {
        newPerms = octalToPermissions(mode, node.type);
    } else if (mode.length === 10) {
        newPerms = mode;
    } else {
        const symbolic = parseSymbolicMode(newPerms, mode);
        if (symbolic) newPerms = symbolic;
        else return null;
    }

    const newFs = deepCloneFileSystem(fileSystem);
    const nodeClone = walkToNode(newFs, resolvedPath);
    if (!nodeClone) return null;
    nodeClone.permissions = newPerms;
    return { newFs };
}

export function chownOp(
    fileSystem: FileNode,
    resolvedPath: string,
    owner: string,
    actingUser: User,
    group?: string
): { newFs: FileNode } | null {
    const node = getNodeAtPathFn(fileSystem, resolvedPath, actingUser);
    if (!node) return null;
    if (actingUser.username !== 'root') return null;

    const newFs = deepCloneFileSystem(fileSystem);
    const nodeClone = walkToNode(newFs, resolvedPath);
    if (!nodeClone) return null;
    if (owner) nodeClone.owner = owner;
    if (group) nodeClone.group = group;
    return { newFs };
}
