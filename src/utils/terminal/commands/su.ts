import { TerminalCommand } from '../types';

export const su: TerminalCommand = {
    name: 'su',
    description: 'Change user ID or become superuser',
    usage: 'su [username] [password]',
    execute: async ({ args, fileSystem, terminalUser, spawnSession }) => {
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

        // Verify Password
        // Note: In simulation, we might accept empty password if user has no password set?
        // Or if running as root, no password needed.
        if (terminalUser !== 'root') {
            // Real su asks for password. Here we expect it in args for sim simplicity, 
            // or check if matches defined password.
            const correctPassword = user.password;
            // If password arg provided, check it.
            if (password) {
                if (password !== correctPassword) {
                    return { output: ['su: Authentication failure'], error: true };
                }
            } else {
                // If no password provided, and user has one, fail (simulating prompt requirement)
                // But for strict simulation without interactive prompt, we might assume failure 
                // UNLESS it's a known demo account with known password?
                // Let's enforce providing password in args for now: `su root admin`
                return { output: ['su: Password required (usage: su <user> <pass>)'], error: true };
            }
        }

        // Success: Spawn Session
        spawnSession(targetUser);
        return { output: [`Logged in as ${targetUser}`] };
    },
};
