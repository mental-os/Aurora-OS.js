import { TerminalCommand } from '../types';

export const su: TerminalCommand = {
    name: 'su',
    description: 'Change user ID or become superuser',
    descriptionKey: 'terminal.commands.su.description',
    usage: 'su [username] [password]',
    usageKey: 'terminal.commands.su.usage',
    execute: async (context) => {
        const { args, fileSystem, terminalUser, spawnSession, prompt } = context;
        let targetUser = 'root';
        let password = '';

        if (args.length > 0) {
            targetUser = args[0];
            if (args.length > 1) {
                password = args[1];
            }
        }

        if (targetUser === terminalUser) {
            return { output: [`Already logged in as ${targetUser}`] };
        }

        // Verify User Exists
        const user = fileSystem.users.find(u => u.username === targetUser);
        if (!user) {
            return { output: [`su: user ${targetUser} does not exist`], error: true };
        }

        // Prompt for password if not root and not provided in args
        if (terminalUser !== 'root' && !password) {
            const entered = await prompt('Password: ', 'password');
            // Prompt cancelled (Ctrl+C): abort the switch cleanly.
            if (entered === null) {
                return { output: [], error: true };
            }
            password = entered;
        }

        // Verify Password
        if (terminalUser !== 'root') {
            if (!context.verifyPassword(targetUser, password)) {
                return { output: ['su: Authentication failure'], error: true };
            }
        }

        // Success: Spawn Session
        spawnSession(targetUser);
        return { output: [`Logged in as ${targetUser}`] };
    },
};
