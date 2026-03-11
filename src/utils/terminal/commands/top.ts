import { createElement } from 'react';
import { TerminalCommand, CommandContext } from '../types';

interface ProcessInfo {
    pid: number;
    user: string;
    pr: number;
    ni: number;
    virt: number;
    res: number;
    shr: number;
    s: string;
    cpu: number;
    mem: number;
    time: string;
    command: string;
}

const generateProcesses = (): ProcessInfo[] => {
    const commands = [
        'bash', 'node', 'chrome', 'firefox', 'code', 'git', 'npm', 'docker',
        'python', 'java', 'ssh', 'systemd', 'kubelet', 'containerd', 'postgres',
        'redis-server', 'nginx', 'apache2', 'mysql', 'mongod'
    ];
    const users = ['root', 'user', 'admin', 'www-data', 'postgres', 'redis', 'nobody'];
    
    const processes: ProcessInfo[] = [];
    
    for (let i = 0; i < 15; i++) {
        const pid = Math.floor(Math.random() * 30000) + 100;
        const user = users[Math.floor(Math.random() * users.length)];
        const pr = Math.floor(Math.random() * 40) - 20;
        const ni = pr;
        const virt = Math.floor(Math.random() * 8000000) + 500000;
        const res = Math.floor(Math.random() * 2000000) + 100000;
        const shr = Math.floor(Math.random() * 500000) + 10000;
        const states = ['R', 'S', 'D', 'Z', 'T'];
        const s = states[Math.floor(Math.random() * states.length)];
        const cpu = Math.random() * 25;
        const mem = Math.random() * 15;
        const minutes = Math.floor(Math.random() * 120);
        const seconds = Math.floor(Math.random() * 60);
        const time = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const command = commands[Math.floor(Math.random() * commands.length)];
        
        processes.push({
            pid,
            user,
            pr,
            ni,
            virt,
            res,
            shr,
            s,
            cpu,
            mem,
            time,
            command
        });
    }
    
    processes.sort((a, b) => b.cpu - a.cpu);
    
    return processes;
};

const formatBytes = (kb: number): string => {
    if (kb >= 1024 * 1024) {
        return `${(kb / 1024 / 1024).toFixed(1)}g`;
    } else if (kb >= 1024) {
        return `${(kb / 1024).toFixed(1)}m`;
    }
    return `${kb}`;
};

export const top: TerminalCommand = {
    name: 'top',
    description: 'Display real-time process information',
    descriptionKey: 'terminal.commands.top.description',
    usage: 'top [-n num] [-d secs]',
    usageKey: 'terminal.commands.top.usage',
    execute: async (context: CommandContext) => {
        const { args, stdin } = context;
        
        if (stdin && stdin.length > 0) {
            return {
                output: [
                    createElement('div', { className: 'text-yellow-400' }, 
                        'top: processes received from pipe - showing filtered view'
                    ),
                    '',
                    ...stdin.map(line => `  ${line}`)
                ],
                error: false
            };
        }
        
        let iterations = 1;
        
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-n' && args[i + 1]) {
                iterations = parseInt(args[i + 1], 10) || 1;
                i++;
            } else if (args[i] === '-d' && args[i + 1]) {
                i++;
            }
        }
        
        const processes = generateProcesses();
        
        const totalMem = 16 * 1024 * 1024;
        const usedMem = processes.reduce((acc, p) => acc + p.res, 0);
        
        const loadAvg = (Math.random() * 2).toFixed(2);
        
        const header = createElement('div', { className: 'font-mono text-xs' },
            createElement('div', { className: 'mb-1' }, 
                `top - ${new Date().toLocaleTimeString()} up  1:23,  1 user,  load average: ${loadAvg}, ${loadAvg}, ${(parseFloat(loadAvg) * 0.8).toFixed(2)}`
            ),
            createElement('div', { className: 'mb-1' },
                `Tasks: ${processes.length} total,   1 running, ${processes.length - 1} sleeping,   0 stopped,   0 zombie`
            ),
            createElement('div', { className: 'mb-1' },
                `%Cpu(s): ${(Math.random() * 30).toFixed(1)} us,  ${(Math.random() * 10).toFixed(1)} sy,  ${(Math.random() * 5).toFixed(1)} ni, ${(95 - parseFloat(loadAvg) * 10).toFixed(1)} id,  ${(Math.random() * 5).toFixed(1)} wa`
            ),
            createElement('div', { className: 'mb-2' },
                `MiB Mem : ${(totalMem / 1024).toFixed(1)} total, ${((totalMem - usedMem) / 1024).toFixed(1)} free, ${(usedMem / 1024).toFixed(1)} used, ${(totalMem * 0.1 / 1024).toFixed(1)} buff/cache`
            ),
            createElement('div', { className: 'mb-2' },
                `MiB Swap: ${(totalMem * 0.5 / 1024).toFixed(1)} total, ${(totalMem * 0.4 / 1024).toFixed(1)} free, ${(totalMem * 0.1 / 1024).toFixed(1)} used. ${(totalMem * 0.8 / 1024).toFixed(1)} avail Mem`
            ),
            createElement('div', { className: 'text-gray-400' },
                '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND'
            )
        );
        
        const processRows = processes.slice(0, 12).map(p => {
            const stateColor = p.s === 'R' ? 'text-green-400' : 
                              p.s === 'D' ? 'text-yellow-400' : 
                              p.s === 'Z' ? 'text-red-400' : '';
            
            return createElement('div', { key: p.pid, className: 'font-mono text-xs whitespace-pre' },
                `${p.pid.toString().padStart(5)} `,
                `${p.user.padEnd(8)} `,
                `${p.pr.toString().padStart(3)} `,
                `${p.ni.toString().padStart(3)} `,
                `${formatBytes(p.virt).padStart(7)} `,
                `${formatBytes(p.res).padStart(6)} `,
                `${formatBytes(p.shr).padStart(6)} `,
                createElement('span', { className: stateColor }, p.s.padEnd(2)),
                ` ${p.cpu.toFixed(1).padStart(5)} `,
                `${p.mem.toFixed(1).padStart(5)} `,
                `${p.time.padStart(8)} `,
                p.command
            );
        });
        
        const footer = createElement('div', { className: 'mt-2 text-gray-400 text-xs' },
            `top - ${iterations} iteration(s) requested (press 'q' to quit)`
        );
        
        return {
            output: [header, ...processRows, footer],
            error: false
        };
    },
};
