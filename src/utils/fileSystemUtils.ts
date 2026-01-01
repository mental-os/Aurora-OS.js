import pkg from '../../package.json';
import startupSound from '../assets/sounds/Runway Electric.mp3';
import startupSound2 from '../assets/sounds/Lo-Fi Girl.mp3';
import { getCoreApps } from '../config/appRegistry';

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
            {
                name: 'Music',
                type: 'directory',
                children: [
                    { name: 'Runway Electric.mp3', type: 'file', content: startupSound, size: 2048, owner: username, permissions: '-rw-r--r--' },
                    { name: 'Lo-Fi Girl.mp3', type: 'file', content: startupSound2, size: 2048, owner: username, permissions: '-rw-r--r--' }
                ],
                owner: username,
                permissions: 'drwxr-xr-x'
            },
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

export function octalToPermissions(mode: string, type: 'file' | 'directory'): string {
    if (mode.length !== 3) return type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--'; // Fallback

    const map = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];

    // Validate octal
    if (!/^[0-7]{3}$/.test(mode)) return type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--';

    const u = parseInt(mode[0]);
    const g = parseInt(mode[1]);
    const o = parseInt(mode[2]);

    return (type === 'directory' ? 'd' : '-') + map[u] + map[g] + map[o];
}

export function parseSymbolicMode(currentPerms: string, mode: string): string | null {
    // Regex for symbolic mode: [ugoa]*[+\-=][rwx]*
    // e.g. +x, u+rw, go-w, a=rwx
    const match = mode.match(/^([ugoa]*)([-+=])([rwx]*)$/);
    if (!match) return null;

    const [, who, op, perms] = match;
    const users = who || 'a'; // Default to all if not specified

    // Convert current permissions to mutable array
    // current: drwxr-xr-x (10 chars)
    const newPerms = currentPerms.split('');

    // Indices in the permission string (0 is type)
    // u: 1,2,3
    // g: 4,5,6
    // o: 7,8,9

    const targets: number[] = [];
    if (users.includes('a') || users.includes('u')) targets.push(1, 2, 3);
    if (users.includes('a') || users.includes('g')) targets.push(4, 5, 6);
    if (users.includes('a') || users.includes('o')) targets.push(7, 8, 9);

    // Helper to check if index corresponds to r, w, or x
    const getPermChar = (idx: number) => {
        const type = (idx - 1) % 3;
        return type === 0 ? 'r' : type === 1 ? 'w' : 'x';
    };

    targets.forEach(idx => {
        const charType = getPermChar(idx); // r, w, or x
        const isTargetPerm = perms.includes(charType);

        // If the permission char (e.g. 'x') is NOT in the requested perms (e.g. mode is '+w'), 
        // we shouldn't touch 'x' unless op is '='

        if (op === '=') {
            // Set: Only enable if it's in perms, otherwise disable
            if (isTargetPerm) {
                newPerms[idx] = charType;
            } else {
                // But wait, if mode is 'u=rw', do we touch 'x'? Yes, 'u=rw' implies 'u=rw-'.
                // Check if this index matches the char type we are looking for.
                // Actually we iterate over indices 1..9.
                // If index 3 is 'x', and perms is 'rw', then we set index 3 to '-'.
                // BUT we only affect indices that MATCH the chars in 'perms'? No.
                // The 'perms' string in command contains the bits to SET.
                // Correct logic for '=':
                // Loop through the relevant BLOCK (u, g, or o).
                // For each position (r, w, x), if that char is in `perms`, set it. Else unset it.
                // My loop iterates targets which are flat.

                // If the char at this index (r/w/x) is present in `perms` string, set it.
                // Else, set to '-'.
                const typeC = (idx - 1) % 3; // 0=r, 1=w, 2=x
                const expectedChar = typeC === 0 ? 'r' : typeC === 1 ? 'w' : 'x';

                // We only change the specific bit if the user ASKED to change it?
                // No, '=' sets EXACT permissions. `chmod u=r file` -> u becomes r--.
                if (perms.includes(expectedChar)) {
                    newPerms[idx] = expectedChar;
                } else {
                    newPerms[idx] = '-';
                }
            }
        } else if (op === '+') {
            // Add: Only enable if it's in perms
            if (isTargetPerm) {
                // If checking for 'x' and current index is indeed the 'x' slot
                if (getPermChar(idx) === charType) { // This check is redundant but safe
                    newPerms[idx] = charType;
                }
            }
            // Correction: My loop iterates ALL target indices (r,w,x for u,g,o).
            // If I do `chmod +x`, perms is `x`.
            // Iteration:
            // idx=1 (u-r): charType='r'. perms has 'x'. no match.
            // idx=3 (u-x): charType='x'. perms has 'x'. match! Set newPerms[3] = 'x'.

            // Re-eval logic inside loop:
            const typeC = (idx - 1) % 3;
            const expectedChar = typeC === 0 ? 'r' : typeC === 1 ? 'w' : 'x';
            if (perms.includes(expectedChar)) {
                newPerms[idx] = expectedChar;
            }
        } else if (op === '-') {
            // Remove
            const typeC = (idx - 1) % 3;
            const expectedChar = typeC === 0 ? 'r' : typeC === 1 ? 'w' : 'x';
            if (perms.includes(expectedChar)) {
                newPerms[idx] = '-';
            }
        }
    });

    return newPerms.join('');
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
                { name: 'ls', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command ls\n# list directory contents' },
                { name: 'cat', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command cat\n# concatenate files' },
                { name: 'cd', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command cd\n# change directory' },
                { name: 'pwd', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command pwd\n# print working directory' },
                { name: 'mkdir', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command mkdir\n# make directories' },
                { name: 'rm', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command rm\n# remove files or directories' },
                { name: 'cp', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command cp\n# copy files' },
                { name: 'mv', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command mv\n# move files' },
                { name: 'touch', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command touch\n# create empty file' },
                { name: 'echo', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command echo\n# display a line of text' },
                { name: 'clear', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command clear\n# clear terminal screen' },
                { name: 'whoami', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command whoami\n# print effective userid' },
                { name: 'grep', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command grep\n# search text patterns' },
                { name: 'find', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command find\n# search for files' },
                { name: 'date', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command date\n# print date' },
                { name: 'uptime', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command uptime\n# show system uptime' },
                { name: 'hostname', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command hostname\n# show hostname' },
                { name: 'who', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command who\n# show logged in users' },
                { name: 'chmod', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command chmod\n# change permissions' },
                { name: 'chown', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command chown\n# change owner' },
                { name: 'su', type: 'file', permissions: '-rwsr-xr-x', owner: 'root', content: '#!/bin/bash\n#command su\n# switch user' },
                { name: 'sudo', type: 'file', permissions: '-rwsr-xr-x', owner: 'root', content: '#!/bin/bash\n#command sudo\n# execute as superuser' },
                { name: 'reset', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', content: '#!/bin/bash\n#command reset\n# reset system' },
            ],
        },
        // Boot loader files
        {
            name: 'boot',
            type: 'directory',
            permissions: 'drwxr-xr-x', // 755
            owner: 'root',
            children: [
                { name: 'kernel', type: 'file', permissions: '-rw-r--r--', owner: 'root', content: `${pkg.build.productName} Kernel ${pkg.version}` },
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
                { name: 'passwd', type: 'file', permissions: '-rw-r--r--', owner: 'root', content: 'root:admin:0:0:System Administrator:/root:/bin/bash\nuser:1234:1000:1000:User:/home/user:/bin/bash\nguest:guest:1001:1001:Guest:/home/guest:/bin/bash' },
                { name: 'group', type: 'file', permissions: '-rw-r--r--', owner: 'root', content: 'root:x:0:root\nusers:x:100:user,guest\nadmin:x:10:user' },
                { name: 'hostname', type: 'file', permissions: '-rw-r--r--', owner: 'root', content: 'aurora' },
                { name: 'hosts', type: 'file', permissions: '-rw-r--r--', owner: 'root', content: '127.0.0.1\tlocalhost\n::1\t\tlocalhost' },
                { name: 'os-release', type: 'file', permissions: '-rw-r--', owner: 'root', content: `NAME="${pkg.build.productName}"\nVERSION="${pkg.version}"\nID=${pkg.name}\nPRETTY_NAME="${pkg.build.productName}"` },
                {
                    name: 'apt',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    children: [
                        { name: 'sources.list', type: 'file', permissions: '-rw-r--r--', owner: 'root', content: `# ${pkg.build.productName} package sources\ndeb https://packages.aurora.os/stable main` },
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
                                { name: 'TEST.txt', type: 'file', content: `NAME="${pkg.build.productName}"\nVERSION="${pkg.version}"\nID=${pkg.name}\nPRETTY_NAME="${pkg.build.productName}"`, size: 60, owner: 'user', permissions: '-rw-r--r--' }
                            ]
                        },
                        {
                            name: 'Documents',
                            type: 'directory',
                            owner: 'user',
                            permissions: 'drwxr-xr-x',
                            children: [
                                { name: 'WELCOME.md', type: 'file', content: '# Welcome to Aurora OS\n\nYou are now using the most advanced web-based operating system simulation.\n\n## Getting Started\n1. Use the **Terminal** to explore the system at a deeper level.\n2. Check **Settings** to customize your experience.\n3. Explore `/var/log` if you are curious about system events.\n\n## Tips\n- Use `Ctrl+C` to interrupt running commands.\n- Use `sudo` for administrative tasks (root password: admin).\n', size: 300, owner: 'user', permissions: '-rw-r--r--' },
                                { name: 'PROJECT_NOTES.txt', type: 'file', content: 'TODO:\n- Fix the reality anchor stability glitch.\n- Investigate why /tmp is accumulating strange temp files.\n- Update the firewall rules.\n', size: 120, owner: 'user', permissions: '-rw-r--r--' },
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
                        {
                            name: 'Music',
                            type: 'directory',
                            children: [
                                { name: 'Runway Electric.mp3', type: 'file', content: startupSound, size: 2048, owner: 'user', permissions: '-rw-r--r--' },
                                { name: 'Lo-Fi Girl.mp3', type: 'file', content: startupSound2, size: 2048, owner: 'user', permissions: '-rw-r--r--' }
                            ],
                            owner: 'user',
                            permissions: 'drwxr-xr-x'
                        },
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
                        { name: 'version', type: 'file', permissions: '-r--r--r--', owner: 'root', content: pkg.version },
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
                        // App binaries only - dynamically generated from core apps
                        ...getCoreApps().map((app) => ({
                            name: app.id,
                            type: 'file' as const,
                            permissions: '-rwxr-xr-x',
                            owner: 'root',
                            content: `#!app ${app.id}`
                        })),
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
                        { name: 'system.log', type: 'file', permissions: '-rw-r-----', owner: 'root', content: '[    0.000000] Linux version 6.6.6-aurora (gcc version 12.2.0) #1 SMP PREEMPT_DYNAMIC\n[    0.002314] Command line: BOOT_IMAGE=/boot/kernel root=/dev/nvme0n1p2 ro quiet splash\n[    0.003451] x86/fpu: Supporting XSAVE feature 0x001: \'x87 floating point registers\'\n[    0.152341] pci 0000:00:02.0: vgaarb: setting as boot-time VGA device\n[    0.892314] systemd[1]: Detected architecture x86-64.\n[    1.234112] aurora-os: integrity verification passed.\n[    2.100231] [FAILED] Failed to start Service Module: "Reality_Anchor".\n[    2.100452] See "systemctl status reality-anchor.service" for details.\n[    2.400000] Finished Initialization.' },
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
