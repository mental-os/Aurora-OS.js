import { ReactNode, createElement } from 'react';
import { TerminalCommand } from '../types';
import { FileIcon } from '../../../components/ui/FileIcon';

// We need a helper to render the FileIcon since we can't use hooks inside execute directly if it's not a component
// But execute returns ReactNodes, so we can return a component structure.
// However, we need accentColor. We'll access it via a hack or pass it in context if we update context.
// Actually, types says we have args, fileSystem etc. We don't have accentColor in CommandContext.
// Let's rely on standard colors or basic rendering for now, OR update context props in Terminal.tsx to pass it.

export const ls: TerminalCommand = {
    name: 'ls',
    description: 'List directory contents',
    usage: 'ls [path]',
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
                        // ANSI color for directories
                        // Note: React might not render ANSI codes directly, Terminal.tsx handles mostly strings. 
                        // But we return ReactNode[]. We can return spans.
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
                    // Grid view
                    // We need a wrapper component to access context or just use default colors
                    // For now, we return a simple grid. The original used FileIcon.
                    // We can import FileIcon.

                    const grid = createElement('div', { key: lsPath, className: 'flex flex-wrap gap-x-4 gap-y-1' },
                        contents.map(node => (
                            createElement('div', { key: node.id, className: 'flex items-center gap-2' },
                                createElement('div', { className: 'w-4 h-4 shrink-0 inline-flex items-center justify-center' },
                                    createElement(FileIcon, {
                                        name: node.name,
                                        type: node.type,
                                        accentColor: '#60a5fa', // Default blue, ideally passed from context
                                        isEmpty: node.children?.length === 0
                                    })
                                ),
                                createElement('span', { className: node.type === 'directory' ? 'font-bold text-blue-400' : '' }, node.name)
                            )
                        ))
                    );
                    allOutputs.push(grid);
                }
            } else {
                allOutputs.push(`ls: ${pathArg}: No such file or directory`);
                error = true;
            }
        });

        return { output: allOutputs, error };
    },
};
