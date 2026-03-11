import { TerminalCommand, CommandContext } from '../types';

interface TarOptions {
    create: boolean;
    extract: boolean;
    list: boolean;
    verbose: boolean;
    file: string | null;
    gzip: boolean;
    bzip2: boolean;
}

function parseOptions(args: string[]): { options: TarOptions; remainingArgs: string[] } {
    const options: TarOptions = {
        create: false,
        extract: false,
        list: false,
        verbose: false,
        file: null,
        gzip: false,
        bzip2: false,
    };

    const remainingArgs: string[] = [];
    
    for (const arg of args) {
        if (arg.startsWith('-') && !arg.startsWith('--')) {
            const flags = arg.slice(1);
            for (const flag of flags) {
                switch (flag) {
                    case 'c':
                        options.create = true;
                        break;
                    case 'x':
                        options.extract = true;
                        break;
                    case 't':
                        options.list = true;
                        break;
                    case 'v':
                        options.verbose = true;
                        break;
                    case 'f':
                        options.file = null;
                        break;
                    case 'z':
                        options.gzip = true;
                        break;
                    case 'j':
                        options.bzip2 = true;
                        break;
                }
            }
            if (flags.includes('f')) {
                const fIndex = flags.indexOf('f');
                const afterF = flags.slice(fIndex + 1);
                if (afterF) {
                    options.file = afterF;
                }
            }
        } else {
            remainingArgs.push(arg);
        }
    }

    return { options, remainingArgs };
}

function getParentPath(filePath: string): string {
    const lastSlash = filePath.lastIndexOf('/');
    if (lastSlash === -1) return '/';
    if (lastSlash === 0) return '/';
    return filePath.substring(0, lastSlash);
}

function getFileName(filePath: string): string {
    const lastSlash = filePath.lastIndexOf('/');
    if (lastSlash === -1) return filePath;
    return filePath.substring(lastSlash + 1);
}

export const tar: TerminalCommand = {
    name: 'tar',
    description: 'Archive utility',
    usage: 'tar [-ctxf] archive.tar [files...]',
    execute: (context: CommandContext) => {
        const { args, fileSystem, resolvePath, currentPath } = context;
        const { readFile, createFile, getNodeAtPath, listDirectory } = fileSystem;

        if (args.length === 0) {
            return {
                output: ['tar: missing file operand\nTry \'tar --help\' for more information.'],
                error: true
            };
        }

        const { options, remainingArgs } = parseOptions(args);

        if (options.gzip) {
            return {
                output: ['tar: option -z (gzip) is not fully supported in this simulation'],
                error: true
            };
        }

        if (options.bzip2) {
            return {
                output: ['tar: option -j (bzip2) is not fully supported in this simulation'],
                error: true
            };
        }

        if (!options.create && !options.extract && !options.list) {
            return {
                output: ['tar: you must specify one of the -c, -x, or -t options'],
                error: true
            };
        }

        if (options.create && options.extract) {
            return {
                output: ['tar: cannot use both -c and -x options'],
                error: true
            };
        }

        let archivePath: string | null = null;
        const fileIndex = args.findIndex(a => a === '-f');
        
        if (options.file) {
            archivePath = resolvePath(options.file);
        } else if (fileIndex !== -1 && args[fileIndex + 1]) {
            archivePath = resolvePath(args[fileIndex + 1]);
        } else {
            for (const arg of remainingArgs) {
                if (arg.endsWith('.tar') || arg.endsWith('.tar.gz') || arg.endsWith('.tgz')) {
                    archivePath = resolvePath(arg);
                    break;
                }
            }
        }

        if (!archivePath && (options.extract || options.list)) {
            return {
                output: ['tar: missing archive file operand'],
                error: true
            };
        }

        if (options.create) {
            if (!archivePath) {
                return {
                    output: ['tar: option -f is required for creating'],
                    error: true
                };
            }

            const filesToArchive = remainingArgs.filter(a => !a.startsWith('-'));
            
            if (filesToArchive.length === 0) {
                return {
                    output: ['tar: no files specified'],
                    error: true
                };
            }

            const archiveContent: string[] = [];
            archiveContent.push('# AURORA_TAR_V1');

            const outputLines: string[] = [];

            for (const fileArg of filesToArchive) {
                const filePath = resolvePath(fileArg);
                const node = getNodeAtPath(filePath);

                if (!node) {
                    outputLines.push(`tar: ${fileArg}: No such file or directory`);
                    continue;
                }

                if (node.type === 'directory') {
                    const contents = listDirectory(filePath);
                    if (contents) {
                        for (const item of contents) {
                            const itemPath = filePath === '/' ? `/${item.name}` : `${filePath}/${item.name}`;
                            const itemContent = item.type === 'directory' ? '' : (readFile(itemPath) || '');
                            const relativePath = itemPath.replace(/^\/+/, '');
                            archiveContent.push(`${relativePath}|${item.type}|${itemContent.length}`);
                            archiveContent.push(itemContent);
                            
                            if (options.verbose) {
                                outputLines.push(`${item.name}`);
                            }
                        }
                    }
                } else {
                    const content = readFile(filePath) || '';
                    const relativePath = filePath.replace(/^\/+/, '');
                    archiveContent.push(`${relativePath}|file|${content.length}`);
                    archiveContent.push(content);

                    if (options.verbose) {
                        outputLines.push(getFileName(fileArg));
                    }
                }
            }

            const parentPath = getParentPath(archivePath);
            const archiveName = getFileName(archivePath);
            const success = createFile(parentPath, archiveName, archiveContent.join('\n'));

            if (!success) {
                return {
                    output: [`tar: ${archiveName}: Failed to create archive`],
                    error: true
                };
            }

            if (outputLines.length === 0) {
                return { output: [] };
            }
            return { output: outputLines };
        }

        if (options.extract) {
            if (!archivePath) {
                return {
                    output: ['tar: missing archive file operand'],
                    error: true
                };
            }

            const archiveNode = getNodeAtPath(archivePath);
            if (!archiveNode) {
                return {
                    output: [`tar: ${archivePath}: Cannot open: No such file or directory`],
                    error: true
                };
            }

            const archiveContent = readFile(archivePath);
            if (!archiveContent) {
                return {
                    output: [`tar: ${archivePath}: Cannot read: Is a directory or unreadable`],
                    error: true
                };
            }

            const lines = archiveContent.split('\n');
            if (lines[0] !== '# AURORA_TAR_V1') {
                return {
                    output: [`tar: ${archivePath}: Not a valid Aurora tar archive`],
                    error: true
                };
            }

            const outputLines: string[] = [];
            let i = 1;
            const extractToPath = remainingArgs[0] ? resolvePath(remainingArgs[0]) : currentPath;

            while (i < lines.length) {
                const headerLine = lines[i];
                if (!headerLine) {
                    i++;
                    continue;
                }

                const parts = headerLine.split('|');
                if (parts.length < 3) {
                    i++;
                    continue;
                }

                const [filename, contentType, _sizeStr] = parts;
                i++;

                if (i >= lines.length) break;

                const content = lines[i];
                i++;

                const targetPath = extractToPath === '/' 
                    ? `/${filename}` 
                    : `${extractToPath}/${filename}`;
                const targetParent = getParentPath(targetPath);
                const targetName = getFileName(targetPath);

                if (options.verbose) {
                    outputLines.push(filename);
                }

                if (contentType === 'directory') {
                    fileSystem.createDirectory(targetParent, targetName);
                } else {
                    createFile(targetParent, targetName, content);
                }
            }

            if (outputLines.length === 0) {
                return { output: [] };
            }
            return { output: outputLines };
        }

        if (options.list) {
            if (!archivePath) {
                return {
                    output: ['tar: missing archive file operand'],
                    error: true
                };
            }

            const archiveNode = getNodeAtPath(archivePath);
            if (!archiveNode) {
                return {
                    output: [`tar: ${archivePath}: Cannot open: No such file or directory`],
                    error: true
                };
            }

            const archiveContent = readFile(archivePath);
            if (!archiveContent) {
                return {
                    output: [`tar: ${archivePath}: Cannot read: Is a directory or unreadable`],
                    error: true
                };
            }

            const lines = archiveContent.split('\n');
            if (lines[0] !== '# AURORA_TAR_V1') {
                return {
                    output: [`tar: ${archivePath}: Not a valid Aurora tar archive`],
                    error: true
                };
            }

            const outputLines: string[] = [];
            let i = 1;

            while (i < lines.length) {
                const headerLine = lines[i];
                if (!headerLine) {
                    i++;
                    continue;
                }

                const parts = headerLine.split('|');
                if (parts.length < 3) {
                    i++;
                    continue;
                }

                const [filename, _contentType] = parts;
                outputLines.push(filename);
                i += 2;
            }

            return { output: outputLines };
        }

        return { output: [] };
    },
};
