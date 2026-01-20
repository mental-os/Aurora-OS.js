import { TerminalCommand } from '../types';

export const exit: TerminalCommand = {
    name: 'exit',
    description: 'Exit the current shell session',
    descriptionKey: 'terminal.commands.exit.description',
    execute: async ({ closeSession, closeWindow, isRootSession }) => {
        if (isRootSession) {
            if (closeWindow) {
                closeWindow();
                return { output: [] };
            }
            return { output: ['logout (no window context)'] };
        }

        closeSession();
        return { output: ['logout'] };
    },
};
