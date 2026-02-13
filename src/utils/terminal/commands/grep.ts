import { TerminalCommand } from '../types';

export const grep: TerminalCommand = {
    name: 'grep',
    description: 'Print lines matching a pattern',
    descriptionKey: 'terminal.commands.grep.description',
    usage: 'grep <pattern> <file>',
    usageKey: 'terminal.commands.grep.usage',
    execute: ({ args, fileSystem: { readFile }, resolvePath, stdin }) => {
        if (args.length === 0) {
            return { output: ['grep: missing pattern'], error: true };
        }

        const pattern = args[0];
        let contentToScan: string[];

        // Case 1: File provided
        if (args.length >= 2) {
            const filePath = resolvePath(args[1]);
            const content = readFile(filePath);
            if (content === null) {
                return { output: [`grep: ${args[1]}: No such file or directory`], error: true };
            }
            contentToScan = content.split('\n');
        }
        // Case 2: Stdin provided
        else if (stdin && stdin.length > 0) {
            contentToScan = stdin;
        }
        // Case 3: No input
        else {
            return { output: ['grep: missing file operand'], error: true };
        }

        try {
            const regex = new RegExp(pattern);
            const matches = contentToScan.filter(line => regex.test(line));
            return { output: matches };
        } catch {
            return { output: [`grep: invalid pattern '${pattern}'`], error: true };
        }
    },
};
