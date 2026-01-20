import { TerminalCommand } from '../types';

export const cat: TerminalCommand = {
    name: 'cat',
    description: 'Display file contents',
    descriptionKey: 'terminal.commands.cat.description',
    usage: 'cat <file>',
    usageKey: 'terminal.commands.cat.usage',
    execute: ({ args, fileSystem, resolvePath, stdin }) => {
        if (args.length === 0) {
            if (stdin && stdin.length > 0) {
                return { output: stdin };
            }
            return { output: ['cat: missing file operand'], error: true };
        }

        const output: string[] = [];
        let error = false;

        args.forEach(arg => {
            const filePath = resolvePath(arg);
            const content = fileSystem.readFile(filePath);

            if (content !== null) {
                output.push(...content.split('\n'));
            } else {
                const node = fileSystem.getNodeAtPath(filePath);
                if (node) {
                    output.push(`cat: ${arg}: Permission denied`);
                } else {
                    output.push(`cat: ${arg}: No such file or directory`);
                }
                error = true;
            }
        });

        return { output, error };
    },
};
