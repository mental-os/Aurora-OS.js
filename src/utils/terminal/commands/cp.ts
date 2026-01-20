import { TerminalCommand } from '../types';
import { checkPermissions } from '../../../utils/fileSystemUtils';

export const cp: TerminalCommand = {
    name: 'cp',
    description: 'Copy files',
    descriptionKey: 'terminal.commands.cp.description',
    usage: 'cp <source> <dest>',
    usageKey: 'terminal.commands.cp.usage',
    execute: (context) => {
        const { args, fileSystem, resolvePath, terminalUser } = context;
        const { readFile, createFile, getNodeAtPath, users, currentUser } = fileSystem;

        if (args.length < 2) {
            return { output: ['cp: missing file operand'], error: true };
        }

        const activeUser = terminalUser || currentUser || 'user';
        const userObj = users.find(u => u.username === activeUser) || users[0];

        const sourcePath = resolvePath(args[0]);
        const destPath = resolvePath(args[1]);

        // Check source
        const sourceNode = getNodeAtPath(sourcePath);
        if (!sourceNode) {
            return { output: [`cp: cannot stat '${args[0]}': No such file or directory`], error: true };
        }
        if (sourceNode.type === 'directory') {
            return { output: [`cp: -r not specified; omitting directory '${args[0]}'`], error: true };
        }

        if (!checkPermissions(sourceNode, userObj, 'read')) {
            return { output: [`cp: cannot open '${args[0]}' for reading: Permission denied`], error: true };
        }

        const content = readFile(sourcePath);
        if (content === null) {
            return { output: [`cp: cannot read '${args[0]}': Permission denied`], error: true };
        }

        // Determine destination name and parent
        let destName = '';
        let parentPath = '';

        // If dest is directory, copy into it with same name
        const destNode = getNodeAtPath(destPath);
        if (destNode && destNode.type === 'directory') {
            destName = sourceNode.name;
            parentPath = destPath;

            // Check write perm on dest dir
            if (!checkPermissions(destNode, userObj, 'write')) {
                return { output: [`cp: cannot create regular file '${destPath}/${destName}': Permission denied`], error: true };
            }

        } else {
            // Dest is the new file path
            const lastSlash = destPath.lastIndexOf('/');
            if (lastSlash === -1 || lastSlash === 0 && destPath === '/') {
                parentPath = lastSlash === 0 ? '/' : destPath.substring(0, lastSlash);
                destName = destPath.substring(lastSlash + 1);
            } else {
                parentPath = destPath.substring(0, lastSlash);
                destName = destPath.substring(lastSlash + 1);
            }

            // Handle root special case for parent path calculation if needed
            if (parentPath === '') parentPath = '/';

            // Check parent existence and perm
            const parentNode = getNodeAtPath(parentPath);
            if (!parentNode) {
                return { output: [`cp: cannot create regular file '${args[1]}': No such file or directory`], error: true };
            }
            if (!checkPermissions(parentNode, userObj, 'write')) {
                return { output: [`cp: cannot create regular file '${args[1]}': Permission denied`], error: true };
            }
        }

        const success = createFile(parentPath, destName, content);

        if (!success) {
            // Try to overwrite if it exists
            const fullDestPath = parentPath === '/' ? `/${destName}` : `${parentPath}/${destName}`;
            const existingNode = getNodeAtPath(fullDestPath);
            
            if (existingNode && existingNode.type === 'file') {
                 if (!checkPermissions(existingNode, userObj, 'write')) {
                    return { output: [`cp: cannot create regular file '${fullDestPath}': Permission denied`], error: true };
                 }
                 const writeSuccess = fileSystem.writeFile(fullDestPath, content);
                 if (!writeSuccess) {
                     return { output: [`cp: cannot create regular file '${args[1]}': Operation failed`], error: true };
                 }
            } else {
                 return { output: [`cp: cannot create regular file '${args[1]}': Operation failed`], error: true };
            }
        }

        return { output: [] };
    },
};
