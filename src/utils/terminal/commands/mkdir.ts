import { TerminalCommand } from '../types';
import { checkPermissions } from '../../../utils/fileSystemUtils';

export const mkdir: TerminalCommand = {
    name: 'mkdir',
    description: 'Create directory',
    usage: 'mkdir <name>',
    execute: (context) => {
        const { args, fileSystem, resolvePath } = context;
        if (args.length === 0) {
            return { output: ['mkdir: missing operand'], error: true };
        }

        const output: string[] = [];
        let error = false;

        const { getNodeAtPath, createDirectory, users, currentUser } = fileSystem;
        // Resolve effective user for permission checks
        // terminalUser might be undefined if not strictly typed in all contexts, fallback to currentUser
        const activeUser = context.terminalUser || currentUser || 'user';
        const userObj = users.find(u => u.username === activeUser) || {
            username: 'nobody', uid: 65534, gid: 65534, fullName: 'Nobody', homeDir: '/', shell: ''
        };

        // Parse flags
        const directories: string[] = [];
        let parents = false; // -p flag

        args.forEach(arg => {
            if (arg.startsWith('-')) {
                if (arg.includes('p')) parents = true;
            } else {
                directories.push(arg);
            }
        });

        if (directories.length === 0) {
            return { output: ['mkdir: missing operand'], error: true };
        }

        const resolveParent = (path: string): string => {
            const idx = path.lastIndexOf('/');
            return idx <= 0 ? '/' : path.substring(0, idx);
        };

        // Recursive creator
        const ensureDir = (path: string): boolean => {
            const node = getNodeAtPath(path);
            if (node) {
                return node.type === 'directory'; // Success if it exists and is dir (for -p)
            }

            const parent = resolveParent(path);
            const parentNode = getNodeAtPath(parent);

            if (!parentNode) {
                // Parent missing
                if (parents) {
                    // Try to create parent first
                    if (!ensureDir(parent)) return false;
                    // Now parent should exist
                } else {
                    return false; // Fail if parent missing and not -p
                }
            }

            // Now parent exists (or we returned false)
            // Check parent again (refresh)
            const freshParent = getNodeAtPath(parent);
            if (!freshParent || freshParent.type !== 'directory') return false;

            // Check permissions on parent
            if (!checkPermissions(freshParent, userObj, 'write')) return false;

            const name = path.substring(path.lastIndexOf('/') + 1);
            return createDirectory(parent, name);
        };

        directories.forEach(arg => {
            const fullPath = resolvePath(arg);

            // If -p, use recursive logic
            if (parents) {
                if (!ensureDir(fullPath)) {
                    output.push(`mkdir: cannot create directory '${arg}': Operation failed`);
                    error = true;
                }
            } else {
                // Standard logic
                const lastSlashIndex = fullPath.lastIndexOf('/');
                const parentPath = lastSlashIndex === 0 ? '/' : fullPath.substring(0, lastSlashIndex);
                const name = fullPath.substring(lastSlashIndex + 1);

                const parentNode = getNodeAtPath(parentPath);
                if (!parentNode) {
                    output.push(`mkdir: cannot create directory '${arg}': No such file or directory`);
                    error = true;
                    return;
                }

                if (!checkPermissions(parentNode, userObj, 'write')) {
                    output.push(`mkdir: cannot create directory '${arg}': Permission denied`);
                    error = true;
                    return;
                }

                const success = createDirectory(parentPath, name);
                if (!success) {
                    if (parentNode.children?.some(c => c.name === name)) {
                        output.push(`mkdir: cannot create directory '${arg}': File exists`);
                    } else {
                        output.push(`mkdir: cannot create directory '${arg}': Operation failed`);
                    }
                    error = true;
                }
            }
        });

        return { output, error };
    },
};
