import pkg from '../../package.json';

export interface FileNode {
    id: string;
    name: string;
    type: 'file' | 'directory';
    content?: string;
    children?: FileNode[];
    permissions?: string;
    owner?: string;
    group?: string;
    size?: number;
    modified?: Date;
}

export interface User {
    username: string;
    password?: string;
    uid: number;
    gid: number;
    fullName: string;
    homeDir: string;
    shell: string;
    groups?: string[]; // Supplementary groups
}

export interface Group {
    groupName: string;
    password?: string;
    gid: number;
    members: string[]; // usernames
}

export function parsePasswd(content: string): User[] {
    return content.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => {
            const [username, password, uidStr, gidStr, fullName, homeDir, shell] = line.split(':');
            return {
                username,
                password,
                uid: parseInt(uidStr, 10),
                gid: parseInt(gidStr, 10),
                fullName,
                homeDir,
                shell
            };
        });
}

export function formatPasswd(users: User[]): string {
    return users.map(u =>
        `${u.username}:${u.password || 'x'}:${u.uid}:${u.gid}:${u.fullName}:${u.homeDir}:${u.shell}`
    ).join('\n');
}

export function parseGroup(content: string): Group[] {
    return content.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => {
            const [groupName, password, gidStr, membersStr] = line.split(':');
            return {
                groupName,
                password,
                gid: parseInt(gidStr, 10),
                members: membersStr ? membersStr.split(',') : []
            };
        });
}

export function formatGroup(groups: Group[]): string {
    return groups.map(g =>
        `${g.groupName}:${g.password || 'x'}:${g.gid}:${g.members.join(',')}`
    ).join('\n');
}

// Efficient deep clone function for FileNode
export function deepCloneFileNode(node: FileNode): FileNode {
    const cloned: FileNode = {
        id: node.id,
        name: node.name,
        type: node.type,
        content: node.content,
        permissions: node.permissions,
        owner: node.owner,
        group: node.group,
        size: node.size,
        modified: node.modified ? new Date(node.modified) : undefined,
    };

    if (node.children) {
        cloned.children = node.children.map(child => deepCloneFileNode(child));
    }

    return cloned;
}

// Ensure every node has an ID (recursive)
export function ensureIds(node: any): FileNode {
    if (!node.id) {
        node.id = crypto.randomUUID();
    }

    if (node.children) {
        node.children.forEach((child: any) => ensureIds(child));
    }

    return node as FileNode;
}

// Efficient deep clone for entire file system with ID assurance
export function deepCloneFileSystem(root: FileNode): FileNode {
    const cloned = deepCloneFileNode(root);
    return ensureIds(cloned);
}

// Check if a node is a descendant of another (to prevent recursive moves)
export function isDescendant(parent: FileNode, targetId: string): boolean {
    if (!parent.children) return false;
    for (const child of parent.children) {
        if (child.id === targetId) return true;
        if (child.type === 'directory') {
            if (isDescendant(child, targetId)) return true;
        }
    }
    return false;
}

// Helper to find node and its parent by ID
export function findNodeAndParent(root: FileNode, targetId: string): { node: FileNode, parent: FileNode } | null {
    if (root.children) {
        for (const child of root.children) {
            if (child.id === targetId) {
                return { node: child, parent: root };
            }
            if (child.type === 'directory') {
                const result = findNodeAndParent(child, targetId);
                if (result) return result;
            }
        }
    }
    return null;
}

// Helper to create a user home directory structure (macOS-inspired)
export function createUserHome(username: string, permissions: string = 'drwxr-x---'): any {
    return {
        name: username,
        type: 'directory',
        owner: username,
        permissions: permissions,
        children: [
            { name: 'Desktop', type: 'directory', children: [], owner: username, permissions: 'drwxr-xr-x' },
            { name: 'Documents', type: 'directory', children: [], owner: username, permissions: 'drwxr-xr-x' },
            { name: 'Downloads', type: 'directory', children: [], owner: username, permissions: 'drwxr-xr-x' },
            { name: 'Pictures', type: 'directory', children: [], owner: username, permissions: 'drwxr-xr-x' },
            { name: 'Music', type: 'directory', children: [], owner: username, permissions: 'drwxr-xr-x' },
            { name: 'Videos', type: 'directory', children: [], owner: username, permissions: 'drwxr-xr-x' },
            { name: '.Config', type: 'directory', children: [], owner: username, permissions: 'drwx------' },
            { name: '.Trash', type: 'directory', children: [], owner: username, permissions: 'drwx------' },
        ],
    };
}

export function checkPermissions(
    node: FileNode,
    user: User,
    operation: 'read' | 'write' | 'execute'
): boolean {
    if (user.uid === 0 || user.username === 'root') return true;

    const perms = node.permissions || (node.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--');

    // 1. Check Owner
    if (node.owner === user.username) {
        const checkChar = perms[1 + (operation === 'read' ? 0 : operation === 'write' ? 1 : 2)];
        return checkChar !== '-';
    }

    // 2. Check Group (Primary + Supplementary)
    let userInGroup = false;
    if (node.group) {
        if (node.group === user.gid.toString()) {
            userInGroup = true;
        } else if (user.groups && user.groups.includes(node.group)) {
            userInGroup = true;
        }
    }

    if (userInGroup) {
        const checkChar = perms[4 + (operation === 'read' ? 0 : operation === 'write' ? 1 : 2)];
        return checkChar !== '-';
    }

    // 3. Check Others
    const checkChar = perms[7 + (operation === 'read' ? 0 : operation === 'write' ? 1 : 2)];

    // Handle Sticky Bit (t/T) and regular x interaction for 'execute' on others
    // Sticky bit is at index 9 (last char), replacing 'x'
    // 't' = sticky + executable by others
    // 'T' = sticky + NOT executable by others
    if (operation === 'execute' && (checkChar === 't' || checkChar === 'T')) {
        return checkChar === 't';
    }

    // Standard rwx check
    return checkChar !== '-';
}

// Normalized Initial File System
export const initialFileSystem: any = {
    name: '/',
    type: 'directory',
    permissions: 'drwxr-xr-x', // 755
    owner: 'root',
    children: [
        // Essential command binaries
        {
            name: 'bin',
            type: 'directory',
            permissions: 'drwxr-xr-x', // 755
            owner: 'root',
            children: [
                { name: 'ls', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n# list directory contents' },
                { name: 'cat', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n# concatenate files' },
                { name: 'cd', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n# change directory' },
                { name: 'pwd', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n# print working directory' },
                { name: 'mkdir', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n# make directories' },
                { name: 'rm', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n# remove files or directories' },
                { name: 'cp', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n# copy files' },
                { name: 'mv', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n# move files' },
                { name: 'touch', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n# create empty file' },
                { name: 'echo', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n# display a line of text' },
                { name: 'clear', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n# clear terminal screen' },
                { name: 'whoami', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n# print effective userid' },
            ],
        },
        // Boot loader files
        {
            name: 'boot',
            type: 'directory',
            permissions: 'drwxr-xr-x', // 755
            owner: 'root',
            children: [
                { name: 'kernel', type: 'file', permissions: '-rw-r--r--', owner: 'root', content: `Aurora OS Kernel ${pkg.version}` },
                { name: 'initrd', type: 'file', permissions: '-rw-r--r--', owner: 'root', content: 'Initial ramdisk' },
            ],
        },
        // System configuration files
        {
            name: 'etc',
            type: 'directory',
            permissions: 'drwxr-xr-x', // 755
            owner: 'root',
            children: [
                { name: 'passwd', type: 'file', permissions: '-rw-r--r--', owner: 'root', content: 'root:admin:0:0:root:/root:/bin/bash\nuser:1234:1000:1000:User:/home/user:/bin/bash\nguest:guest:1001:1001:Guest:/home/guest:/bin/bash' },
                { name: 'group', type: 'file', permissions: '-rw-r--r--', owner: 'root', content: 'root:x:0:\nusers:x:100:user,guest\nadmin:x:10:user' },
                { name: 'hostname', type: 'file', permissions: '-rw-r--r--', owner: 'root', content: 'aurora' },
                { name: 'hosts', type: 'file', permissions: '-rw-r--r--', owner: 'root', content: '127.0.0.1\tlocalhost\n::1\t\tlocalhost' },
                { name: 'os-release', type: 'file', permissions: '-rw-r--r--', owner: 'root', content: `NAME="Aurora OS"\nVERSION="${pkg.version}"\nID=${pkg.name}\nPRETTY_NAME="Aurora OS.js"` },
                {
                    name: 'apt',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    children: [
                        { name: 'sources.list', type: 'file', permissions: '-rw-r--r--', owner: 'root', content: '# Aurora package sources\ndeb https://packages.aurora.os/stable main' },
                    ],
                },
            ],
        },
        // User home directories
        {
            name: 'home',
            type: 'directory',
            permissions: 'drwxr-xr-x', // 755 (allows access to /home, but subdirs are restricted)
            owner: 'root',
            children: [
                {
                    ...createUserHome('user'),
                    children: [
                        {
                            name: 'Desktop',
                            type: 'directory',
                            owner: 'user',
                            permissions: 'drwxr-xr-x',
                            children: [
                                { name: 'TEST.txt', type: 'file', content: `NAME="Aurora OS"\nVERSION="${pkg.version}"\nID=${pkg.name}\nPRETTY_NAME="Aurora OS.js"`, size: 60, owner: 'user', permissions: '-rw-r--r--' }
                            ]
                        },
                        {
                            name: 'Documents',
                            type: 'directory',
                            owner: 'user',
                            permissions: 'drwxr-xr-x',
                            children: [
                                { name: 'README.txt', type: 'file', content: 'Welcome to Aurora OS!\n\nThis is your personal documents folder.', size: 60, owner: 'user', permissions: '-rw-r--r--' },
                                { name: 'Notes', type: 'directory', children: [], owner: 'user', permissions: 'drwxr-xr-x' },
                            ],
                        },
                        {
                            name: 'Downloads',
                            type: 'directory',
                            owner: 'user',
                            permissions: 'drwxr-xr-x',
                            children: [
                                { name: 'sample.pdf', type: 'file', content: '[PDF content placeholder]', size: 1024, owner: 'user', permissions: '-rw-r--r--' },
                            ],
                        },
                        { name: 'Pictures', type: 'directory', children: [{ name: 'Screenshots', type: 'directory', children: [], owner: 'user' }], owner: 'user', permissions: 'drwxr-xr-x' },
                        { name: 'Music', type: 'directory', children: [], owner: 'user', permissions: 'drwxr-xr-x' },
                        { name: 'Videos', type: 'directory', children: [], owner: 'user', permissions: 'drwxr-xr-x' },
                        { name: '.Config', type: 'directory', children: [], owner: 'user', permissions: 'drwx------' },
                        { name: '.Trash', type: 'directory', children: [], owner: 'user', permissions: 'drwx------' },
                    ],
                },
                createUserHome('guest', 'drwxr-xr-x'),
            ],
        },
        // Essential shared libraries
        {
            name: 'lib',
            type: 'directory',
            permissions: 'drwxr-xr-x', // 755
            owner: 'root',
            children: [
                { name: 'libc.so', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '# C standard library' },
                { name: 'libm.so', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '# Math library' },
            ],
        },
        // Root user home directory
        {
            name: 'root',
            type: 'directory',
            permissions: 'drwx------', // 700 - Private
            owner: 'root',
            children: [
                { name: 'Desktop', type: 'directory', children: [], owner: 'root', permissions: 'drwxr-xr-x' },
                { name: 'Downloads', type: 'directory', children: [], owner: 'root', permissions: 'drwxr-xr-x' },
                { name: '.Config', type: 'directory', children: [], owner: 'root', permissions: 'drwx------' },
                { name: '.Trash', type: 'directory', children: [], owner: 'root', permissions: 'drwx------' },
                { name: '.bashrc', type: 'file', content: '# Root bash configuration\nexport PS1="root@aurora# "', owner: 'root', permissions: '-rw-------' },
            ],
        },
        // Kernel and system files
        {
            name: 'sys',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            owner: 'root',
            children: [
                {
                    name: 'kernel',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    children: [
                        { name: 'version', type: 'file', permissions: '-r--r--r--', owner: 'root', content: '0.5.2-aurora' },
                    ],
                },
                {
                    name: 'devices',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    children: [
                        { name: 'cpu', type: 'directory', children: [], permissions: 'drwxr-xr-x', owner: 'root' },
                        { name: 'memory', type: 'directory', children: [], permissions: 'drwxr-xr-x', owner: 'root' },
                    ],
                },
            ],
        },
        // User binaries and applications
        {
            name: 'usr',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            owner: 'root',
            children: [
                {
                    name: 'bin',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    children: [
                        { name: 'nano', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n# text editor' },
                        { name: 'vim', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n# vi improved' },
                        { name: 'grep', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n# search text patterns' },
                        { name: 'Finder', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!app finder' },
                        { name: 'Browser', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!app browser' },
                        { name: 'Mail', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!app messages' },
                        { name: 'Music', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!app music' },
                        { name: 'Photos', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!app photos' },
                        { name: 'Settings', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!app settings' },
                        { name: 'Terminal', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!app terminal' },
                        { name: 'find', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n# search for files' },
                    ],
                },
                {
                    name: 'lib',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    children: [],
                },
                {
                    name: 'share',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    children: [
                        {
                            name: 'applications',
                            type: 'directory',
                            permissions: 'drwxr-xr-x',
                            owner: 'root',
                            children: [
                                { name: 'Finder.desktop', type: 'file', permissions: '-rw-r--r--', owner: 'root', content: '[Desktop Entry]\nName=Finder\nExec=finder\nType=Application' },
                                { name: 'Terminal.desktop', type: 'file', permissions: '-rw-r--r--', owner: 'root', content: '[Desktop Entry]\nName=Terminal\nExec=terminal\nType=Application' },
                                { name: 'Settings.desktop', type: 'file', permissions: '-rw-r--r--', owner: 'root', content: '[Desktop Entry]\nName=Settings\nExec=settings\nType=Application' },
                            ],
                        },
                    ],
                },
            ],
        },
        // Variable data files
        {
            name: 'var',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            owner: 'root',
            children: [
                {
                    name: 'log',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    children: [
                        { name: 'system.log', type: 'file', permissions: '-rw-r-----', owner: 'root', content: '' },
                        { name: 'auth.log', type: 'file', permissions: '-rw-r-----', owner: 'root', content: '' },
                    ],
                },
                {
                    name: 'tmp',
                    type: 'directory',
                    permissions: 'drwxrwxrwt', // 1777 (Sticky bit)
                    owner: 'root',
                    children: [],
                },
                {
                    name: 'cache',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    children: [],
                },
            ],
        },
    ],
};
