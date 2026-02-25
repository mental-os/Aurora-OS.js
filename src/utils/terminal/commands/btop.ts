import { createElement } from 'react';
import { TerminalCommand, CommandContext } from '../types';

const cpuCores = 8;
const totalMemoryGB = 16;
const usedMemoryGB = 10.4;
const uptime = '2 days, 14:32:45';

const mockProcesses = [
    { pid: 1842, user: 'root', cpu: 45.2, mem: 8.5, command: 'node', nice: 0 },
    { pid: 1247, user: 'aurora', cpu: 23.8, mem: 12.3, command: 'chrome', nice: 0 },
    { pid: 892, user: 'aurora', cpu: 15.4, mem: 4.2, command: 'firefox', nice: 0 },
    { pid: 2104, user: 'root', cpu: 8.9, mem: 2.1, command: 'systemd', nice: 0 },
    { pid: 1567, user: 'aurora', cpu: 6.2, mem: 3.8, command: 'code', nice: 0 },
    { pid: 389, user: 'root', cpu: 4.5, mem: 1.2, command: 'sshd', nice: 0 },
    { pid: 723, user: 'aurora', cpu: 3.1, mem: 2.8, command: 'terminal', nice: 0 },
    { pid: 1845, user: 'aurora', cpu: 2.8, mem: 1.5, command: 'spotify', nice: 0 },
    { pid: 982, user: 'root', cpu: 1.9, mem: 0.8, command: 'cron', nice: 0 },
    { pid: 1456, user: 'aurora', cpu: 1.2, mem: 1.1, command: 'slack', nice: 0 },
];

const generateCpuBar = (usage: number): string => {
    const filled = Math.round(usage / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
};

const generateMemBar = (used: number, total: number): string => {
    const percent = (used / total) * 100;
    const filled = Math.round(percent / 5);
    const empty = 20 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
};

export const btop: TerminalCommand = {
    name: 'btop',
    description: 'Modern resource monitor (better top)',
    usage: 'btop [--help]',
    execute: (context: CommandContext) => {
        const { args } = context;

        if (args.includes('--help') || args.includes('-h')) {
            return {
                output: [
                    createElement('div', { key: 'help', style: { fontFamily: 'monospace', color: '#22d3ee' } },
                        'btop - Modern resource monitor\n',
                        '\nUsage: btop [OPTIONS]\n',
                        '  --help     Show this help message\n',
                        '\nA beautiful, modern resource monitor with CPU, memory, and process monitoring.'
                    )
                ]
            };
        }

        const cpuBars = Array.from({ length: cpuCores }, (_, i) => {
            const usage = Math.random() * 100;
            const bar = generateCpuBar(usage);
            let color = '#22d3ee';
            if (usage > 80) color = '#f87171';
            else if (usage > 60) color = '#facc15';
            else if (usage > 30) color = '#4ade80';
            
            return createElement('div', { key: i, style: { fontFamily: 'monospace', fontSize: '11px' } },
                createElement('span', { style: { color: '#9ca3af' } }, `CPU${i} `),
                createElement('span', { style: { color } }, bar),
                createElement('span', { style: { color: '#ffffff', marginLeft: '8px' } }, `${usage.toFixed(1)}%`)
            );
        });

        const memUsagePercent = (usedMemoryGB / totalMemoryGB) * 100;
        const memBar = generateMemBar(usedMemoryGB, totalMemoryGB);
        let memColor = '#22d3ee';
        if (memUsagePercent > 85) memColor = '#f87171';
        else if (memUsagePercent > 70) memColor = '#facc15';
        else if (memUsagePercent > 50) memColor = '#4ade80';

        const sortedProcesses = [...mockProcesses].sort((a, b) => b.cpu - a.cpu);

        const processRows = sortedProcesses.map((proc, _idx) => {
            let cpuColor = '#22d3ee';
            if (proc.cpu > 80) cpuColor = '#f87171';
            else if (proc.cpu > 50) cpuColor = '#facc15';
            else if (proc.cpu > 25) cpuColor = '#4ade80';

            let memColor = '#e879f9';
            if (proc.mem > 20) memColor = '#f87171';
            else if (proc.mem > 10) memColor = '#facc15';
            else if (proc.mem > 5) memColor = '#4ade80';

            return createElement('div', { key: proc.pid, style: { fontFamily: 'monospace', fontSize: '11px', display: 'flex', gap: '8px' } },
                createElement('span', { style: { color: '#9ca3af', minWidth: '50px' } }, `${proc.pid}`),
                createElement('span', { style: { color: '#4ade80', minWidth: '70px' } }, proc.user.padEnd(8)),
                createElement('span', { style: { color: cpuColor, minWidth: '50px' } }, `${proc.cpu.toFixed(1)}%`),
                createElement('span', { style: { color: memColor, minWidth: '45px' } }, `${proc.mem.toFixed(1)}%`),
                createElement('span', { style: { color: '#ffffff' } }, proc.command)
            );
        });

        const headerStyle = { fontFamily: 'monospace', fontSize: '11px', color: '#22d3ee' as const };
        const valueStyle = { fontFamily: 'monospace', fontSize: '11px', color: '#ffffff' as const };

        const output = createElement('div', { style: { fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.4' } },
            createElement('div', { style: { marginBottom: '8px', ...headerStyle } },
                '┌────────────────────────────────────────────────────────────────────┐'
            ),
            createElement('div', { style: { ...headerStyle, color: '#e879f9' } },
                '│  BTOP  v1.3.0                                          2026-02-25  │'
            ),
            createElement('div', { style: headerStyle },
                '├────────────────────────────────────────────────────────────────────┤'
            ),
            createElement('div', { style: { paddingLeft: '4px', marginBottom: '4px' } },
                createElement('div', { style: { ...valueStyle, marginBottom: '4px' } },
                    createElement('span', { style: { color: '#9ca3af' } }, 'System: '),
                    'Aurora-OS.js  |  ',
                    createElement('span', { style: { color: '#9ca3af' } }, 'Uptime: '),
                    uptime
                ),
                createElement('div', { style: valueStyle },
                    createElement('span', { style: { color: '#9ca3af' } }, 'CPU Cores: '),
                    cpuCores
                ),
            ),
            createElement('div', { style: { ...headerStyle, marginTop: '4px' } },
                '├────────────────────────────────────────────────────────────────────┤'
            ),
            createElement('div', { style: { paddingLeft: '4px', marginBottom: '8px' } },
                createElement('div', { style: { marginBottom: '4px', ...headerStyle } }, 'CPU Usage:'),
                ...cpuBars
            ),
            createElement('div', { style: { ...headerStyle } },
                '├────────────────────────────────────────────────────────────────────┤'
            ),
            createElement('div', { style: { paddingLeft: '4px', marginBottom: '8px' } },
                createElement('div', { style: { marginBottom: '4px', ...headerStyle } }, 'Memory:'),
                createElement('div', { style: { ...valueStyle } },
                    '[',
                    createElement('span', { style: { color: memColor } }, memBar),
                    '] ',
                    `${usedMemoryGB.toFixed(1)}G / ${totalMemoryGB}G (${memUsagePercent.toFixed(1)}%)`
                )
            ),
            createElement('div', { style: { ...headerStyle } },
                '├────────────────────────────────────────────────────────────────────┤'
            ),
            createElement('div', { style: { paddingLeft: '4px', marginBottom: '8px' } },
                createElement('div', { style: { marginBottom: '6px', ...headerStyle } }, 'Processes:'),
                createElement('div', { style: { display: 'flex', gap: '8px', ...valueStyle, color: '#9ca3af', marginBottom: '4px' } },
                    createElement('span', { style: { minWidth: '50px' } }, 'PID'),
                    createElement('span', { style: { minWidth: '70px' } }, 'USER'),
                    createElement('span', { style: { minWidth: '50px' } }, 'CPU%'),
                    createElement('span', { style: { minWidth: '45px' } }, 'MEM%'),
                    createElement('span', {}, 'COMMAND')
                ),
                ...processRows
            ),
            createElement('div', { style: headerStyle },
                '└────────────────────────────────────────────────────────────────────┘'
            )
        );

        return { output: [output] };
    },
};
