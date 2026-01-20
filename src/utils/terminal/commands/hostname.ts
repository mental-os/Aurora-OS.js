import { TerminalCommand } from '../types';

export const hostname: TerminalCommand = {
    name: 'hostname',
    description: 'Print system hostname',
    descriptionKey: 'terminal.commands.hostname.description',
    execute: ({ fileSystem }) => {
        const { readFile } = fileSystem;
        const hostname = readFile('/etc/hostname') || 'aurora';
        return { output: [hostname.trim()] };
    },
};
