import { TerminalCommand } from '../types';
import { checkPermissions } from '../../../utils/fileSystemUtils';

export const cd: TerminalCommand = {
    name: 'cd',
    description: 'Change directory',
    usage: 'cd <path>',
    execute: ({ args, fileSystem, resolvePath, setCurrentPath, terminalUser }) => {
        const { getNodeAtPath, users, currentUser, homePath } = fileSystem;
        const activeUser = terminalUser || currentUser || 'user';
        const userObj = users.find(u => u.username === activeUser) || {
            username: 'nobody', uid: 65534, gid: 65534, fullName: 'Nobody', homeDir: '/', shell: ''
        };

        if (args.length === 0 || args[0] === '~') {
            setCurrentPath(homePath);
            return { output: [], newCwd: homePath };
        }

        const newPath = resolvePath(args[0]);
        const node = getNodeAtPath(newPath);

        if (node && node.type === 'directory') {
            // Permission Check: Execute (Enter directory)
            if (!checkPermissions(node, userObj, 'execute')) {
                return { output: [`cd: ${args[0]}: Permission denied`], error: true };
            }
            setCurrentPath(newPath);
            return { output: [], newCwd: newPath };
        }

        return { output: [`cd: ${args[0]}: No such directory`], error: true };
    },
};
