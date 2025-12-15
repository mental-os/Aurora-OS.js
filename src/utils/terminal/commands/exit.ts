import { TerminalCommand } from '../types';

export const exit: TerminalCommand = {
    name: 'exit',
    description: 'Exit the current shell session',
    execute: async ({ closeSession }) => {
        closeSession();
        // If we were in a nested session, this pops it.
        // If we were at base session, closeSession (as implemented in Terminal.tsx) does nothing.
        // Ideally we would close the app here if base session, but we don't have that capability exposed easily yet.

        return { output: ['logout'] };
    },
};
