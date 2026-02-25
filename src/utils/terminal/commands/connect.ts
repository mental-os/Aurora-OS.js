import { TerminalCommand } from '../types';

/**
 * `connect <ip|hostname>` — switches the terminal session to an NPC computer.
 *
 * The actual target resolution and session switching is handled by
 * useTerminalLogic via the `connect` function injected into CommandContext.
 * This command is intentionally thin — logic lives in the hook.
 */
export const connect: TerminalCommand = {
    name: 'connect',
    description: 'Connect to a remote NPC computer',
    usage: 'connect <ip|hostname>',
    execute: async ({ args, connectedTo, connect: connectFn }) => {
        if (args.length === 0) {
            return { output: ['Usage: connect <ip|hostname>'], error: true };
        }

        if (connectedTo) {
            return {
                output: [`Already connected to ${connectedTo}. Use 'exit' to disconnect first.`],
                error: true,
            };
        }

        const target = args[0];
        connectFn(target);
        return { output: [] }; // Feedback printed by useTerminalLogic after state update
    },
};
