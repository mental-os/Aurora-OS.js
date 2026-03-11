import { TerminalCommand, CommandContext } from '../types';

interface ZipOptions {
    recursive: boolean;
    quiet: boolean;
    move: boolean;
}

function parseOptions(args: string[]): { options: ZipOptions; remainingArgs: string[] } {
    const options: ZipOptions = {
        recursive: false,
        quiet: false,
        move: false,
    };

    const remainingArgs: string[] = [];
    
    for (const arg of args) {
        if (arg.startsWith('-') && !arg.startsWith('--')) {
            const flags = arg.slice(1);
            for (const flag of flags) {
                switch (flag) {
                    case 'r':
                        options.recursive = true;
                        break;
                    case 'q':
                        options.quiet = true;
                        break;
                    case 'm':
                        options.move = true;
                        break;
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

function getRelativePath(fullPath: string, basePath: string): string {
    const normalizedFull = fullPath.replace(/^\/+/, '');
    const normalizedBase = basePath.replace(/^\/+/, '').replace(/\/+$/, '');
    if (normalizedBase === '') return normalizedFull;
    return normalizedFull.replace(new RegExp(`^${normalizedBase}/?`), '');
}

function simpleChecksum(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

function simulateCompression(content: string): { compressed: string; ratio: number } {
    const originalSize = content.length;
    if (originalSize === 0) {
        return { compressed: '', ratio: 0 };
    }
    
    const words = content.split(/\s+/);
    const uniqueWords = new Set(words);
    const compressionFactor = Math.min(0.95, Math.max(0.1, uniqueWords.size / words.length));
    
    const compressedSize = Math.max(1, Math.floor(originalSize * compressionFactor));
    const ratio = Math.round(((originalSize - compressedSize) / originalSize) * 100);
    
    return { compressed: content, ratio };
}

export const zip: TerminalCommand = {
    name: 'zip',
    description: 'Package and compress files',
    usage: 'zip [-r] archive.zip file [file2...]',
    execute: (context: CommandContext) => {
        const { args, fileSystem, resolvePath, currentPath } = context;
        const { readFile, createFile, getNodeAtPath, listDirectory, deleteNode } = fileSystem;

        if (args.length === 0) {
            return {
                output: ['zip: missing archive name\nTry \'zip --help\' for more information.'],
                error: true
            };
        }

        const { options, remainingArgs } = parseOptions(args);

        if (remainingArgs.length < 2) {
            return {
                output: ['zip: first argument must be a zip file\nTry \'zip --help\' for more information.'],
                error: true
            };
        }

        let archiveName = remainingArgs[0];
        if (!archiveName.endsWith('.zip')) {
            archiveName += '.zip';
        }

        const archivePath = resolvePath(archiveName);
        const filesToArchive = remainingArgs.slice(1);

        if (filesToArchive.length === 0) {
            return {
                output: ['zip: nothing to add\nTry \'zip --help\' for more information.'],
                error: true
            };
        }

        const archiveContent: string[] = [];
        archiveContent.push('# AURORA_ZIP_V1');

        const outputLines: string[] = [];
        const warnings: string[] = [];
        let filesAdded = 0;

        const processFile = (filePath: string, basePath: string) => {
            const node = getNodeAtPath(filePath);

            if (!node) {
                warnings.push(`zip warning: ${filePath}: No such file or directory`);
                return;
            }

            if (node.type === 'directory') {
                const relativePath = getRelativePath(filePath, basePath);
                outputLines.push(`  adding: ${relativePath}/ (stored)`);
                filesAdded++;

                if (options.recursive) {
                    const contents = listDirectory(filePath);
                    if (contents) {
                        for (const item of contents) {
                            const itemPath = filePath === '/' ? `/${item.name}` : `${filePath}/${item.name}`;
                            processFile(itemPath, basePath);
                        }
                    }
                } else {
                    warnings.push(`zip warning: ${filePath}/: is a directory -- skipping`);
                }
            } else {
                const content = readFile(filePath) || '';
                const relativePath = getRelativePath(filePath, basePath);
                const originalSize = content.length;
                
                const { compressed, ratio } = simulateCompression(content);
                const checksum = simpleChecksum(content);
                
                archiveContent.push(`${relativePath}|${originalSize}|${compressed.length}|${checksum}`);
                archiveContent.push(content);
                
                const ratioStr = ratio > 0 ? `deflated ${ratio}%` : 'stored';
                outputLines.push(`  adding: ${relativePath} (${ratioStr})`);
                filesAdded++;

                if (options.move) {
                    deleteNode(filePath);
                }
            }
        };

        for (const fileArg of filesToArchive) {
            const filePath = resolvePath(fileArg);
            const basePath = currentPath.replace(/\/+$/, '') || '/';
            processFile(filePath, basePath);
        }

        if (filesAdded === 0) {
            return {
                output: ['zip: No files found in ' + filesToArchive.join(' ')],
                error: true,
            };
        }

        const parentPath = getParentPath(archivePath);
        const archiveFileName = getFileName(archivePath);
        const success = createFile(parentPath, archiveFileName, archiveContent.join('\n'));

        if (!success) {
            return {
                output: [`zip: ${archiveFileName}: Failed to create archive`],
                error: true
            };
        }

        const finalOutput: string[] = [];
        
        if (!options.quiet) {
            finalOutput.push(...outputLines);
            finalOutput.push('');
            finalOutput.push(`Archive:  ${archiveName}`);
        }
        
        if (warnings.length > 0) {
            finalOutput.push(...warnings);
        }
        
        if (!options.quiet) {
            finalOutput.push(`Total files: ${filesAdded}`);
        }

        return { output: finalOutput };
    },
};
