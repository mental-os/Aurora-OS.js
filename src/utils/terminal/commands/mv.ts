import { TerminalCommand } from '../types';
import { checkPermissions } from '../../../utils/fileSystemUtils';

export const mv: TerminalCommand = {
    name: 'mv',
    description: 'Move (rename) files',
    descriptionKey: 'terminal.commands.mv.description',
    usage: 'mv <source> <dest>',
    usageKey: 'terminal.commands.mv.usage',
    execute: (context) => {
        const { args, fileSystem, resolvePath, terminalUser } = context;
        if (args.length < 2) {
            return { output: ['mv: missing file operand'], error: true };
        }

        const { moveNode, getNodeAtPath, users, currentUser } = fileSystem;
        const activeUser = terminalUser || currentUser || 'user';
        const userObj = users.find(u => u.username === activeUser) || users[0];

        const sourcePath = resolvePath(args[0]);
        const destPath = resolvePath(args[1]);
        const sourceNode = getNodeAtPath(sourcePath);

        if (!sourceNode) {
            return { output: [`mv: cannot stat '${args[0]}': No such file or directory`], error: true };
        }

        // Check source parent write perms (for deletion)
        const sourceParentPath = sourcePath.substring(0, sourcePath.lastIndexOf('/')) || '/';
        const sourceParent = getNodeAtPath(sourceParentPath);
        if (sourceParent && !checkPermissions(sourceParent, userObj, 'write')) {
            return { output: [`mv: cannot move '${args[0]}': Permission denied`], error: true };
        }

        // Check dest parent write perms (for creation)
        // Move logic handles renaming. We need to check parent of DEST.
        // If dest is dir, we move INTO it. If dest is file/new, we move TO it (parent is dir).
        let destParentPath: string;
        const destNode = getNodeAtPath(destPath);
        if (destNode && destNode.type === 'directory') {
            destParentPath = destPath;
        } else {
            const lastSlash = destPath.lastIndexOf('/');
            destParentPath = (lastSlash === -1 || (lastSlash === 0 && destPath === '/')) ? '/' : destPath.substring(0, lastSlash);
            if (destParentPath === '') destParentPath = '/';
        }

        const destParent = getNodeAtPath(destParentPath);
        if (!destParent) {
            return { output: [`mv: cannot move to '${args[1]}': No such file or directory`], error: true };
        }
        if (!checkPermissions(destParent, userObj, 'write')) {
            return { output: [`mv: cannot move to '${args[1]}': Permission denied`], error: true };
        }

        const success = moveNode(sourcePath, destPath);

        if (!success) {
            return {
                output: [`mv: cannot move '${args[0]}' to '${args[1]}': Operation failed`],
                error: true
            };
        }

        return { output: [] };
    },
};
