import { ReactNode, createElement } from 'react';
import { TerminalCommand, CommandContext, CommandResult } from '../types';

interface ZipEntry {
    name: string;
    size: number;
    compressedSize: number;
    date: Date;
}

const parseZipContent = (content: string): ZipEntry[] => {
    try {
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
            return data.map((item: any) => ({
                name: item.name || item.file || 'unknown',
                size: item.size || item.uncompressedSize || 0,
                compressedSize: item.compressedSize || item.size || 0,
                date: item.date ? new Date(item.date) : new Date('2024-01-15T10:30:00'),
            }));
        }
    } catch {
        const lines = content.split('\n').filter(l => l.trim());
        return lines.slice(0, 5).map((_line, idx) => ({
            name: `file${idx + 1}.txt`,
            size: Math.floor(Math.random() * 10000) + 100,
            compressedSize: Math.floor(Math.random() * 5000) + 50,
            date: new Date(2024, 0, 15, 10, 30 + idx),
        }));
    }
    return [];
};

const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}`;
};

export const unzip: TerminalCommand = {
    name: 'unzip',
    description: 'Extract compressed files',
    usage: 'unzip archive.zip [-d destination]',
    execute: (context: CommandContext): CommandResult => {
        const { args, fileSystem, resolvePath, currentPath } = context;
        
        const options = {
            destination: '',
            listOnly: false,
            overwrite: false,
            quiet: false,
        };

        const nonOptionArgs: string[] = [];
        
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg === '-l') {
                options.listOnly = true;
            } else if (arg === '-o') {
                options.overwrite = true;
            } else if (arg === '-q') {
                options.quiet = true;
            } else if (arg === '-d' && i + 1 < args.length) {
                options.destination = args[i + 1];
                i++;
            } else if (!arg.startsWith('-')) {
                nonOptionArgs.push(arg);
            }
        }

        if (nonOptionArgs.length === 0) {
            return {
                output: ['unzip: missing archive operand'],
                error: true,
            };
        }

        const archivePath = resolvePath(nonOptionArgs[0]);
        const archiveNode = fileSystem.getNodeAtPath(archivePath);

        if (!archiveNode) {
            return {
                output: [`unzip: cannot find or open ${nonOptionArgs[0]}`],
                error: true,
            };
        }

        const archiveContent = fileSystem.readFile(archivePath);
        if (!archiveContent) {
            return {
                output: [`unzip: cannot read archive ${nonOptionArgs[0]}`],
                error: true,
            };
        }

        let entries: ZipEntry[];
        try {
            entries = parseZipContent(archiveContent);
            if (entries.length === 0) {
                entries = [
                    { name: 'readme.txt', size: 1234, compressedSize: 456, date: new Date('2024-01-15T10:30:00') },
                    { name: 'config.json', size: 5678, compressedSize: 1234, date: new Date('2024-01-15T10:31:00') },
                ];
            }
        } catch {
            entries = [
                { name: 'readme.txt', size: 1234, compressedSize: 456, date: new Date('2024-01-15T10:30:00') },
                { name: 'config.json', size: 5678, compressedSize: 1234, date: new Date('2024-01-15T10:31:00') },
            ];
        }

        const destPath = options.destination 
            ? resolvePath(options.destination) 
            : currentPath;

        const destNode = fileSystem.getNodeAtPath(destPath);
        if (!destNode || destNode.type !== 'directory') {
            return {
                output: [`unzip: cannot extract into ${options.destination || currentPath}: not a directory`],
                error: true,
            };
        }

        const allOutputs: (string | ReactNode)[] = [];

        if (options.listOnly) {
            const archiveName = nonOptionArgs[0].split('/').pop() || nonOptionArgs[0];
            allOutputs.push(`Archive:  ${archiveName}`);
            allOutputs.push('');
            allOutputs.push(createElement('span', { className: 'font-bold' },
                '  Length      Date    Time    Name\n',
                '---------  ---------- -----   ----'
            ));
            
            let totalSize = 0;
            entries.forEach(entry => {
                const sizeStr = entry.size.toString().padStart(9);
                const dateStr = formatDate(entry.date);
                const nameStr = entry.name;
                totalSize += entry.size;
                
                allOutputs.push(`${sizeStr}  ${dateStr}   ${nameStr}`);
            });

            const totalSizeStr = totalSize.toString().padStart(9);
            allOutputs.push('---------                     -------');
            allOutputs.push(`${totalSizeStr}                     ${entries.length} files`);
            
            return { output: allOutputs };
        }

        const archiveName = nonOptionArgs[0].split('/').pop() || nonOptionArgs[0];
        allOutputs.push(`Archive:  ${archiveName}`);

        let extractedCount = 0;
        let skippedCount = 0;
        let totalOriginalSize = 0;

        entries.forEach(entry => {
            const targetPath = `${destPath}/${entry.name}`;
            const existingFile = fileSystem.getNodeAtPath(targetPath);

            if (existingFile && !options.overwrite) {
                if (!options.quiet) {
                    allOutputs.push(`   skipping: ${entry.name}`);
                }
                skippedCount++;
                return;
            }

            if (!options.quiet) {
                allOutputs.push(`  inflating: ${entry.name}`);
            }

            const parentPath = destPath;
            const fileName = entry.name;
            
            const dirParts = fileName.split('/');
            let currentPath = parentPath;
            
            for (let i = 0; i < dirParts.length - 1; i++) {
                const dirName = dirParts[i];
                currentPath = `${currentPath}/${dirName}`;
                if (!fileSystem.getNodeAtPath(currentPath)) {
                    fileSystem.createDirectory(currentPath, dirName);
                }
            }

            const mockContent = `Extracted content of ${fileName}\nSize: ${entry.size} bytes`;
            fileSystem.createFile(destPath, fileName, mockContent);
            
            extractedCount++;
            totalOriginalSize += entry.size;
        });

        allOutputs.push('');
        allOutputs.push(`Archive:  ${archiveName}`);
        allOutputs.push(`   End-of-central-directory summary:`);
        allOutputs.push(`  ${extractedCount} extra files extracted`);
        if (skippedCount > 0) {
            allOutputs.push(`  ${skippedCount} files skipped (use -o to overwrite)`);
        }
        allOutputs.push(`${totalOriginalSize} bytes used (uncompressed)`);
        allOutputs.push(`  extraction completed successfully`);

        return { output: allOutputs };
    },
};
