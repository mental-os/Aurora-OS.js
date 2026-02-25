import { TerminalCommand } from '../types';

const SIMULATED_HOSTS: Record<string, { ip: string; os: string; allowEmptyPassword: boolean }> = {
    'localhost': { ip: '127.0.0.1', os: 'Linux aurora 5.15.0 aurora x86_64', allowEmptyPassword: true },
    '127.0.0.1': { ip: '127.0.0.1', os: 'Linux aurora 5.15.0 aurora x86_64', allowEmptyPassword: true },
    'dev-server': { ip: '192.168.1.100', os: 'Ubuntu 20.04.6 LTS', allowEmptyPassword: false },
    'production': { ip: '203.0.113.50', os: 'Ubuntu 22.04.3 LTS', allowEmptyPassword: false },
    'staging': { ip: '203.0.113.25', os: 'Ubuntu 22.04.3 LTS', allowEmptyPassword: false },
    'backup-server': { ip: '192.168.1.200', os: 'CentOS 7.9', allowEmptyPassword: false },
};

const SIMULATED_COMMANDS: Record<string, Record<string, string>> = {
    'localhost': {
        'whoami': 'root',
        'hostname': 'aurora',
        'uname -a': 'Linux aurora 5.15.0 aurora x86_64 GNU/Linux',
        'pwd': '/root',
        'ls': 'bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var',
        'date': 'Wed Feb 25 10:30:00 UTC 2026',
        'uptime': ' 10:30:00 up 42 days,  3:22,  1 user,  load average: 0.15, 0.10, 0.08',
    },
    '127.0.0.1': {
        'whoami': 'root',
        'hostname': 'aurora',
        'uname -a': 'Linux aurora 5.15.0 aurora x86_64 GNU/Linux',
        'pwd': '/root',
        'ls': 'bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var',
        'date': 'Wed Feb 25 10:30:00 UTC 2026',
        'uptime': ' 10:30:00 up 42 days,  3:22,  1 user,  load average: 0.15, 0.10, 0.08',
    },
    'dev-server': {
        'whoami': 'developer',
        'hostname': 'dev-server',
        'uname -a': 'Linux dev-server 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux',
        'pwd': '/home/developer',
        'ls': 'projects  scripts  logs  config',
        'date': 'Wed Feb 25 10:30:00 UTC 2026',
        'uptime': ' 10:30:00 up 15 days,  2:10,  3 users,  load average: 0.05, 0.03, 0.02',
        'cat /etc/os-release': 'NAME="Ubuntu"\nVERSION="20.04.6 LTS (Focal Fossa)"\nID=ubuntu\nID_LIKE=debian\nPRETTY_NAME="Ubuntu 20.04.6 LTS"',
    },
    'production': {
        'whoami': 'admin',
        'hostname': 'production',
        'uname -a': 'Linux production 5.15.0-91-generic #102-Ubuntu SMP x86_64 GNU/Linux',
        'pwd': '/home/admin',
        'ls': 'app  config  logs  backups  scripts',
        'date': 'Wed Feb 25 10:30:00 UTC 2026',
        'uptime': ' 10:30:00 up 89 days, 12:45,  5 users,  load average: 0.22, 0.18, 0.15',
    },
    'staging': {
        'whoami': 'developer',
        'hostname': 'staging',
        'uname -a': 'Linux staging 5.15.0-91-generic #102-Ubuntu SMP x86_64 GNU/Linux',
        'pwd': '/home/developer',
        'ls': 'app  config  logs  tests',
        'date': 'Wed Feb 25 10:30:00 UTC 2026',
        'uptime': ' 10:30:00 up 30 days,  8:20,  2 users,  load average: 0.08, 0.05, 0.03',
    },
    'backup-server': {
        'whoami': 'backup',
        'hostname': 'backup-server',
        'uname -a': 'Linux backup-server 3.10.0-1160.el7.x86_64 #1 SMP x86_64 GNU/Linux',
        'pwd': '/home/backup',
        'ls': 'backups  snapshots  logs',
        'date': 'Wed Feb 25 10:30:00 UTC 2026',
        'uptime': ' 10:30:00 up 120 days,  4:30,  1 user,  load average: 0.01, 0.02, 0.01',
    },
};

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
    description: 'Secure shell login',
    usage: 'ssh [-p port] user@host [command]',
    execute: async ({ args, prompt }) => {
        const { user, host, command } = parseSshArgs(args);
        
        if (!host) {
            return {
                output: ['ssh: missing host operand', `Usage: ${'ssh [-p port] user@host [command]'}`],
                error: true,
            };
        }
        
        const hostInfo = SIMULATED_HOSTS[host];
        
        if (!hostInfo) {
            const simulatedIp = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
            return {
                output: [
                    'Connecting to host...',
                    `The authenticity of host '${host} (${simulatedIp})' can't be established.`,
                    `ECDSA key fingerprint is SHA256:${Math.random().toString(36).substring(2, 50)}.`,
                    'Are you sure you want to continue connecting (yes/no)? yes',
                    `Warning: Permanently added '${host}' (ECDSA) to the list of known hosts.`,
                    `${user || 'unknown'}@${host}:~$ Connection refused`,
                ],
                error: true,
            };
        }
        
        const displayUser = user || 'root';
        
        const outputs: string[] = [
            `Connecting to host...`,
            `The authenticity of host '${host} (${hostInfo.ip})' can't be established.`,
            `ECDSA key fingerprint is SHA256:${Math.random().toString(36).substring(2, 50)}.`,
            'Are you sure you want to continue connecting (yes/no)? yes',
            `Warning: Permanently added '${host}' (ECDSA) to the list of known hosts.`,
        ];
        
        if (hostInfo.allowEmptyPassword) {
            outputs.push(`${displayUser}@${host}'s password: (pressing enter accepts no password)`);
            outputs.push(`Welcome to ${hostInfo.os}`);
            outputs.push(`Last login: ${new Date().toUTCString()}`);
        } else {
            const password = await prompt(`Password:`, 'password');
            if (!password) {
                return {
                    output: [...outputs, 'Permission denied, please try again.'],
                    error: true,
                };
            }
            outputs.push(`Welcome to ${hostInfo.os}`);
            outputs.push(`Last login: ${new Date().toUTCString()}`);
        }
        
        if (command) {
            const commands = SIMULATED_COMMANDS[host];
            if (commands) {
                const output = commands[command] || `bash: ${command.split(' ')[0]}: command not found`;
                outputs.push(output);
                outputs.push(`Connection to ${host} closed.`);
            } else {
                outputs.push(`bash: ${command.split(' ')[0]}: command not found`);
                outputs.push(`Connection to ${host} closed.`);
            }
            return { output: outputs };
        }
        
        outputs.push('');
        outputs.push(`${displayUser}@${host}:~$ `);
        
        return { output: outputs };
    },
};
