import { TerminalCommand } from '../types';

function parseSshArgs(args: string[]): { port?: number; user?: string; host?: string; command?: string } {
    let port: number | undefined;
    let user: string | undefined;
    let host: string | undefined;
    let command: string | undefined;
    
    let i = 0;
    while (i < args.length) {
        const arg = args[i];
        if (arg === '-p' && i + 1 < args.length) {
            port = parseInt(args[i + 1], 10);
            i += 2;
        } else if (arg.startsWith('-')) {
            i++;
        } else if (arg.includes('@')) {
            const parts = arg.split('@');
            user = parts[0];
            host = parts[1];
            i++;
        } else if (!host) {
            host = arg;
            i++;
        } else {
            command = args.slice(i).join(' ');
            break;
        }
    }
    
    return { port, user, host, command };
}

export const ssh: TerminalCommand = {
    name: 'ssh',
    description: 'Secure shell login to NPC computers',
    usage: 'ssh [-p port] user@host [command]',
    execute: async ({ args, connect, connectedTo, prompt }) => {
        const { user, host, command } = parseSshArgs(args);
        
        if (!host) {
            return {
                output: ['ssh: missing host operand', `Usage: ssh [-p port] user@host [command]`],
                error: true,
            };
        }

        if (connectedTo) {
            return {
                output: [`ssh: already connected to ${connectedTo}. Use 'exit' or 'disconnect' first.`],
                error: true,
            };
        }
        
        const outputs: string[] = [
            `Connecting to ${host}...`,
            `The authenticity of host '${host} (unknown)' can't be established.`,
            `ECDSA key fingerprint is SHA256:${Math.random().toString(36).substring(2, 50)}.`,
            'Are you sure you want to continue connecting (yes/no)? yes',
            `Warning: Permanently added '${host}' (ECDSA) to the list of known hosts.`,
        ];

        let targetIp = host;
        if (!host.includes('.') && !host.match(/^\d+\.\d+\.\d+\.\d+$/)) {
            targetIp = host;
        }

        try {
            const password = await prompt(`Password:`, 'password');
            
            outputs.push(`Welcome to Aurora OS NPC`);
            outputs.push(`Last login: ${new Date().toUTCString()}`);

            if (command) {
                outputs.push(`${user || 'guest'}@${host}:~$ ${command}`);
                outputs.push(`bash: ${command.split(' ')[0]}: command not found - NPC command execution requires 'connect' command`);
                outputs.push(`Connection to ${host} closed.`);
            } else {
                outputs.push('');
                outputs.push('NPC remote session started.');
                outputs.push('Use terminal commands to interact with the remote system.');
                outputs.push("Type 'exit' to close the connection.");
                
                connect(targetIp);
            }
            
            return { output: outputs };
        } catch {
            return {
                output: [...outputs, 'Connection closed.'],
                error: true,
            };
        }
    },
};
