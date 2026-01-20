import { ReactNode, createElement } from 'react';
import { TerminalCommand } from '../types';

// We need a helper to render the FileIcon since we can't use hooks inside execute directly if it's not a component
// But execute returns ReactNodes, so we can return a component structure.
// However, we need accentColor. We'll access it via a hack or pass it in context if we update context.
// Actually, types says we have args, fileSystem etc. We don't have accentColor in CommandContext.
// Let's rely on standard colors or basic rendering for now, OR update context props in Terminal.tsx to pass it.

export const ls: TerminalCommand = {
    name: 'ls',
    description: 'List directory contents',
    descriptionKey: 'terminal.commands.ls.description',
    usage: 'ls [path]',
    usageKey: 'terminal.commands.ls.usage',
    execute: ({ args, fileSystem, resolvePath, currentPath }) => {
        let pathsToList = args.filter(a => !a.startsWith('-'));
        if (pathsToList.length === 0) pathsToList = [''];
        const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al') || args.includes('-ll');

        const allOutputs: (string | ReactNode)[] = [];
        let error = false;

        pathsToList.forEach((pathArg, idx) => {
            const lsPath = pathArg ? resolvePath(pathArg) : currentPath;

            if (pathsToList.length > 1) {
                if (idx > 0) allOutputs.push('');
                allOutputs.push(`${pathArg || '.'}:`);
            }

            const contents = fileSystem.listDirectory(lsPath);
            if (contents) {
                if (contents.length === 0) {
                    // empty
                } else if (longFormat) {
                    const lines = contents.map(node => {
                        const perms = node.permissions || (node.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--');
                        const owner = node.owner || 'root';
                        const group = node.group || (node.owner === 'root' ? 'root' : 'users'); // Fallback logic
                        const size = node.size?.toString().padStart(6) || '     0';
                        
                        const nameNode = node.type === 'directory'
                            ? createElement('span', { className: 'text-blue-400 font-bold' }, node.name)
                            : node.name;

                        return createElement('div', { key: node.id, className: 'whitespace-pre font-mono' },
                            `${perms}  ${owner} ${group}  ${size}  `,
                            nameNode
                        );
                    });
                    allOutputs.push(...lines);
                } else {
                    // Simplified Text View (Linux style)
                    // We render a flex container with items that wrap
                    const items = contents.map(node => {
                         return createElement(
                             'span', 
                             {  
                                 key: node.id,
                                 className: node.type === 'directory' ? 'text-blue-400 font-bold mr-4' : 'mr-4' 
                             }, 
                             node.name
                         );
                    });
                    
                    allOutputs.push(
                        createElement('div', { key: lsPath, className: 'flex flex-wrap' }, items)
                    );
                }
            } else {
                // Determine if it's a permission error or not found
                const node = fileSystem.getNodeAtPath(lsPath);
                if (node) {
                    allOutputs.push(`ls: cannot open directory '${pathArg || '.'}': Permission denied`);
                } else {
                    allOutputs.push(`ls: ${pathArg || '.'}: No such file or directory`);
                }
                error = true;
            }
        });

        return { output: allOutputs, error };
    },
};

