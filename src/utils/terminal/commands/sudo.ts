import { TerminalCommand } from '../types';


export const sudo: TerminalCommand = {
    name: 'sudo',
    description: 'Execute a command as another user',
    usage: 'sudo -s',
    execute: async (context) => {
        const { args, fileSystem, spawnSession } = context;
        const currentUserName = fileSystem.currentUser || 'nobody';

        // 1. Check Sudoers Logic FIRST
        let isAuthorized = false;
        if (currentUserName === 'root') {
            isAuthorized = true;
        } else {
            const user = fileSystem.users.find(u => u.username === currentUserName);
            if (user) {
                const adminGroups = ['admin', 'sudo', 'wheel', 'root'];
                const primaryGroup = fileSystem.groups.find(g => g.gid === user.gid);
                if (primaryGroup && adminGroups.includes(primaryGroup.groupName)) isAuthorized = true;
                if (!isAuthorized && user.groups && user.groups.some(g => adminGroups.includes(g))) isAuthorized = true;
                if (!isAuthorized) {
                    const groups = fileSystem.groups.filter(g => adminGroups.includes(g.groupName));
                    if (groups.some(g => g.members.includes(currentUserName))) isAuthorized = true;
                }
            }
        }

        if (!isAuthorized) {
            return { output: [`${currentUserName} is not in the sudoers file. This incident will be reported.`], error: true };
        }

        if (args.includes('-s')) {
            // sudo -s -> sudo shell -> spawn root session directly
            // Sudo implies we are authorized to switch to root (simulated)
            // We bypass 'su' password check because we already checked sudoers
            spawnSession('root');
            return { output: ['Logged in as root'] };
        }

        if (args.length > 0) {
            // sudo <command>
            const cmdName = args[0];
            const cmdArgs = args.slice(1);

            // Dynamic import based on registry?
            // We need to find the command in context.allCommands
            const { allCommands, fileSystem } = context;
            const commandToRun = allCommands.find(c => c.name === cmdName);

            if (!commandToRun) {
                return { output: [`sudo: ${cmdName}: command not found`], error: true };
            }

            // Create Root Context
            // We cast fileSystem to any because .as() is dynamic on the proxy object
            const rootFS = (fileSystem as any).as('root');

            const rootContext = {
                ...context,
                args: cmdArgs,
                fileSystem: rootFS,
                terminalUser: 'root'
            };

            return commandToRun.execute(rootContext);
        }

        return { output: ['usage: sudo -s OR sudo <command>'], error: true };
    },
};
