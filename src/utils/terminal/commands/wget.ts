import { TerminalCommand } from '../types';

const SUPPORTED_URLS: Record<string, { content: string; type: string; size: number }> = {
    'https://example.com/file.zip': {
        content: 'PK\x03\x04Mock ZIP content for file.zip',
        type: 'application/zip',
        size: 12345
    },
    'https://example.com/test.txt': {
        content: 'This is a test file downloaded via wget simulation.',
        type: 'text/plain',
        size: 49
    },
    'https://example.com/image.png': {
        content: '\x89PNG\r\n\x1a\nMock PNG content',
        type: 'image/png',
        size: 22
    },
    'https://example.com/document.pdf': {
        content: '%PDF-1.4 Mock PDF content',
        type: 'application/pdf',
        size: 21
    }
};

function getTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}K`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}M`;
}

export const wget: TerminalCommand = {
    name: 'wget',
    description: 'Download files from the web',
    usage: 'wget [-O output] url',
    execute: (context) => {
        const { args, fileSystem, resolvePath, currentPath } = context;
        
        if (args.length === 0) {
            return { output: ['wget: missing URL'], error: true };
        }

        let outputFile: string | null = null;
        let outputToStdout = false;
        let quiet = false;
        let url: string | null = null;

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg === '-O') {
                if (i + 1 >= args.length) {
                    return { output: ['wget: option requires an argument -- O'], error: true };
                }
                outputFile = args[i + 1];
                if (outputFile === '-') {
                    outputToStdout = true;
                    outputFile = null;
                }
                i++;
            } else if (arg.startsWith('-O')) {
                outputFile = arg.substring(2);
                if (outputFile === '') {
                    return { output: ['wget: option requires an argument -- O'], error: true };
                }
                if (outputFile === '-') {
                    outputToStdout = true;
                    outputFile = null;
                }
            } else if (arg === '-q') {
                quiet = true;
            } else if (arg.startsWith('-')) {
                // Unknown option, ignore
            } else if (!url) {
                url = arg;
            }
        }

        if (!url) {
            return { output: ['wget: missing URL'], error: true };
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return { output: ['wget: URL must start with http:// or https://'], error: true };
        }

        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        const pathname = urlObj.pathname;
        const filename = pathname.split('/').pop() || 'index.html';
        const timestamp = getTimestamp();

        const output: string[] = [];

        if (!quiet) {
            output.push(`${timestamp}--  ${url}`);
            output.push(`Resolving ${hostname}... 142.250.185.78`);
            output.push(`Connecting to ${hostname}:443... connected.`);
            output.push('HTTP request sent, awaiting response... 200 OK');
        }

        const fileInfo = SUPPORTED_URLS[url];
        
        if (!fileInfo) {
            if (!quiet) {
                output.push(`Length: unspecified [text/html]`);
                output.push(`Saving to: '${filename}'`);
                output.push('');
                output.push(`${filename}          0%[                      ]       0  --.--KB/s    in 0.0s`);
                output.push('');
                output.push(`${timestamp} (123 MB/s) - '${filename}' saved [0/0]`);
            }
            return { output, error: true };
        }

        const length = fileInfo.size;
        const contentType = fileInfo.type;

        if (!quiet) {
            output.push(`Length: ${length} (${formatBytes(length)}) [${contentType}]`);
            output.push(`Saving to: '${filename}'`);
            output.push('');
            output.push(`${filename}        100%[===================>]  ${formatBytes(length)}  --.-KB/s    in 0.001s`);
            output.push('');
            output.push(`${timestamp} (123 MB/s) - '${filename}' saved [${length}/${length}]`);
        }

        if (outputToStdout) {
            return { output: [...output, fileInfo.content] };
        }

        if (outputFile) {
            const resolvedPath = resolvePath(outputFile);
            const parentPath = resolvedPath.substring(0, resolvedPath.lastIndexOf('/'));
            const fileName = resolvedPath.split('/').pop() || filename;
            
            const parentNode = fileSystem.getNodeAtPath(parentPath);
            if (!parentNode || parentNode.type !== 'directory') {
                return { output: [...output, `wget: cannot save to '${outputFile}': No such directory`], error: true };
            }

            const success = fileSystem.createFile(parentPath, fileName, fileInfo.content);
            if (!success) {
                return { output: [...output, `wget: failed to write to '${outputFile}'`], error: true };
            }
        } else {
            const parentPath = currentPath;
            const success = fileSystem.createFile(parentPath, filename, fileInfo.content);
            if (!success) {
                return { output: [...output, `wget: failed to write to '${filename}' in current directory`], error: true };
            }
        }

        return { output };
    },
};
