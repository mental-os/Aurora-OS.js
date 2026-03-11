import { TerminalCommand } from '../types';
import { checkPermissions } from '../../../utils/fileSystemUtils';

interface ParsedRemotePath {
    user?: string;
    host: string;
    path: string;
}

function parseRemotePath(path: string): ParsedRemotePath | null {
    const match = path.match(/^(?:([a-zA-Z0-9_]+)@)?([a-zA-Z0-9_.-]+):(.+)$/);
    if (!match) return null;
    return {
        user: match[1],
        host: match[2],
        path: match[3],
    };
}

function parseScpArgs(args: string[]): {
    options: { recursive: boolean; port?: number; preserve: boolean };
    sources: string[];
    destination: string;
} {
    const options = { recursive: false, port: undefined as number | undefined, preserve: false };
    const sources: string[] = [];
    let destination = '';
    let i = 0;
    while (i < args.length) {
        const arg = args[i];
        if (arg === '-r') {
            options.recursive = true;
            i++;
        } else if (arg === '-P' && i + 1 < args.length) {
            options.port = parseInt(args[i + 1], 10);
            i += 2;
        } else if (arg === '-p') {
            options.preserve = true;
            i++;
        } else if (arg.startsWith('-')) {
            i++;
        } else {
            sources.push(arg);
            i++;
        }
    }
    if (sources.length >= 2) {
        destination = sources.pop()!;
    }
    return { options, sources, destination: destination || '' };
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(0)}GB`;
}

const SIMULATED_HOSTS: Record<string, { ip: string; allowEmptyPassword: boolean }> = {
    'localhost': { ip: '127.0.0.1', allowEmptyPassword: true },
    '127.0.0.1': { ip: '127.0.0.1', allowEmptyPassword: true },
    'dev-server': { ip: '192.168.1.100', allowEmptyPassword: false },
    'production': { ip: '203.0.113.50', allowEmptyPassword: false },
    'staging': { ip: '203.0.113.25', allowEmptyPassword: false },
    'backup-server': { ip: '192.168.1.200', allowEmptyPassword: false },
};

export const scp: TerminalCommand = {
    name: 'scp',
    description: 'Secure copy (remote file transfer)',
    usage: 'scp [-r] source dest',
    execute: async (context) => {
        const { args, fileSystem, resolvePath, prompt, terminalUser, getNodeAtPath, readFile } = context;
        
        const createFile = fileSystem.createFile.bind(fileSystem);
        const writeFile = fileSystem.writeFile.bind(fileSystem);
        const users = fileSystem.users;
        const currentUser = fileSystem.currentUser;
        
        if (args.length < 2) {
            return {
                output: ['scp: missing file operand', `Usage: scp [-r] source dest`],
                error: true,
            };
        }

        const { options, sources, destination } = parseScpArgs(args);

        if (sources.length === 0) {
            return {
                output: ['scp: missing source file', `Usage: scp [-r] source dest`],
                error: true,
            };
        }

        if (!destination) {
            return {
                output: ['scp: missing destination file', `Usage: scp [-r] source dest`],
                error: true,
            };
        }

        const source = sources[0];
        const destRemote = parseRemotePath(destination);
        const sourceRemote = parseRemotePath(source);

        const activeUser = terminalUser || currentUser || 'user';
        const userObj = users.find(u => u.username === activeUser) || users[0];

        if (!sourceRemote && !destRemote) {
            const sourcePath = resolvePath(source);
            const destPath = resolvePath(destination);

            const sourceNode = getNodeAtPath(sourcePath);
            if (!sourceNode) {
                return { output: [`scp: cannot stat '${source}': No such file or directory`], error: true };
            }

            if (sourceNode.type === 'directory' && !options.recursive) {
                return { output: [`scp: -r not specified; omitting directory '${source}'`], error: true };
            }

            if (!checkPermissions(sourceNode, userObj, 'read')) {
                return { output: [`scp: cannot open '${source}': Permission denied`], error: true };
            }

            if (sourceNode.type === 'file') {
                const content = readFile(sourcePath);
                if (content === null) {
                    return { output: [`scp: cannot read '${source}': Permission denied`], error: true };
                }

                const destNode = getNodeAtPath(destPath);
                let destName: string;
                let parentPath: string;

                if (destNode && destNode.type === 'directory') {
                    destName = sourceNode.name;
                    parentPath = destPath;
                    if (!checkPermissions(destNode, userObj, 'write')) {
                        return { output: [`scp: cannot create regular file in '${destination}': Permission denied`], error: true };
                    }
                } else {
                    const lastSlash = destPath.lastIndexOf('/');
                    if (lastSlash === -1) {
                        parentPath = '/';
                        destName = destPath;
                    } else if (lastSlash === 0 && destPath === '/') {
                        parentPath = '/';
                        destName = destPath.substring(1);
                    } else {
                        parentPath = destPath.substring(0, lastSlash);
                        destName = destPath.substring(lastSlash + 1);
                    }
                    if (parentPath === '') parentPath = '/';

                    const parentNode = getNodeAtPath(parentPath);
                    if (!parentNode) {
                        return { output: [`scp: cannot create regular file '${destination}': No such file or directory`], error: true };
                    }
                    if (!checkPermissions(parentNode, userObj, 'write')) {
                        return { output: [`scp: cannot create regular file '${destination}': Permission denied`], error: true };
                    }
                }

                const fullDestPath = parentPath === '/' ? `/${destName}` : `${parentPath}/${destName}`;
                const existingNode = getNodeAtPath(fullDestPath);
                let success = false;

                if (existingNode) {
                    if (existingNode.type === 'file' && checkPermissions(existingNode, userObj, 'write')) {
                        success = writeFile(fullDestPath, content);
                    }
                } else {
                    success = createFile(parentPath, destName, content);
                }

                if (!success) {
                    return { output: [`scp: cannot create regular file '${destination}': Operation failed`], error: true };
                }

                const size = sourceNode.size || content.length;
                const sizeStr = formatFileSize(size);
                return {
                    output: [
                        `${source} -> ${destination}`,
                        `${sourceNode.name.padEnd(50)} 100% ${sizeStr.padStart(6)}    0.0KB/s   00:00`,
                    ],
                };
            }

            if (sourceNode.type === 'directory' && options.recursive) {
                return {
                    output: [
                        `${source} -> ${destination}`,
                        `${sourceNode.name.padEnd(50)} 100%    0  0.0KB/s   00:00`,
                    ],
                };
            }

            return { output: ['scp: unknown error'], error: true };
        }

        if (sourceRemote && destRemote) {
            return {
                output: ['scp: remote to remote transfer not supported in this simulation'],
                error: true,
            };
        }

        if (sourceRemote && !destRemote) {
            const hostInfo = SIMULATED_HOSTS[sourceRemote.host];
            if (!hostInfo) {
                return {
                    output: [`scp: Could not resolve hostname '${sourceRemote.host}': Name or service not known`],
                    error: true,
                };
            }

            const outputs: string[] = [];
            const displayUser = sourceRemote.user || 'root';

            outputs.push(`Connecting to ${sourceRemote.host}...`);

            if (hostInfo.allowEmptyPassword) {
                outputs.push(`${displayUser}@${sourceRemote.host}'s password: (pressing enter accepts no password)`);
            } else {
                const password = await prompt(`Password:`, 'password');
                if (!password) {
                    outputs.push('Permission denied, please try again.');
                    return { output: outputs, error: true };
                }
            }

            outputs.push(`Downloading from ${sourceRemote.host}:${sourceRemote.path}`);

            const fileName = sourceRemote.path.split('/').pop() || 'file';
            const fileSize = Math.floor(Math.random() * 100000) + 1000;
            const sizeStr = formatFileSize(fileSize);
            const speed = (Math.random() * 50 + 10).toFixed(1);

            outputs.push(`${fileName.padEnd(50)} 100% ${sizeStr.padStart(6)}    ${speed}MB/s   00:00`);

            const destPath = resolvePath(destination);
            const destNode = getNodeAtPath(destPath);
            let parentPath: string;
            let destName: string;

            if (destNode && destNode.type === 'directory') {
                parentPath = destPath;
                destName = fileName;
            } else {
                const lastSlash = destPath.lastIndexOf('/');
                if (lastSlash === -1) {
                    parentPath = '/';
                    destName = destPath;
                } else if (lastSlash === 0 && destPath === '/') {
                    parentPath = '/';
                    destName = destPath.substring(1);
                } else {
                    parentPath = destPath.substring(0, lastSlash);
                    destName = destPath.substring(lastSlash + 1);
                }
                if (parentPath === '') parentPath = '/';
            }

            const parentNode = getNodeAtPath(parentPath);
            if (parentNode && checkPermissions(parentNode, userObj, 'write')) {
                const mockContent = `Downloaded from ${sourceRemote.host}:${sourceRemote.path}`;
                createFile(parentPath, destName, mockContent);
            }

            return { output: outputs };
        }

        if (!sourceRemote && destRemote) {
            const hostInfo = SIMULATED_HOSTS[destRemote.host];
            if (!hostInfo) {
                return {
                    output: [`scp: Could not resolve hostname '${destRemote.host}': Name or service not known`],
                    error: true,
                };
            }

            const sourcePath = resolvePath(source);
            const sourceNode = getNodeAtPath(sourcePath);

            if (!sourceNode) {
                return { output: [`scp: cannot stat '${source}': No such file or directory`], error: true };
            }

            if (sourceNode.type === 'directory' && !options.recursive) {
                return { output: [`scp: -r not specified; omitting directory '${source}'`], error: true };
            }

            const outputs: string[] = [];
            const displayUser = destRemote.user || 'root';

            outputs.push(`Connecting to ${destRemote.host}...`);

            if (hostInfo.allowEmptyPassword) {
                outputs.push(`${displayUser}@${destRemote.host}'s password: (pressing enter accepts no password)`);
            } else {
                const password = await prompt(`Password:`, 'password');
                if (!password) {
                    outputs.push('Permission denied, please try again.');
                    return { output: outputs, error: true };
                }
            }

            outputs.push(`Uploading to ${destRemote.host}:${destRemote.path}`);

            const fileName = sourceNode.name;
            const fileSize = sourceNode.size || 1024;
            const sizeStr = formatFileSize(fileSize);
            const speed = (Math.random() * 50 + 10).toFixed(1);

            outputs.push(`${fileName.padEnd(50)} 100% ${sizeStr.padStart(6)}    ${speed}MB/s   00:00`);

            return { output: outputs };
        }

        return { output: ['scp: unknown transfer type'], error: true };
    },
};
