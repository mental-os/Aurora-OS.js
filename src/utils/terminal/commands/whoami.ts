import { TerminalCommand } from '../types';

export const whoami: TerminalCommand = {
    name: 'whoami',
    description: 'Print current user',
    execute: ({ fileSystem, terminalUser }) => {
        return { output: [terminalUser || fileSystem.currentUser || 'nobody'] };
    },
};
