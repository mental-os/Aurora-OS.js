import { TerminalCommand } from '../types';

interface PingHostConfig {
    ip: string;
    baseTime: number;
    variance: number;
    ttl: number;
}

const hostConfigs: Record<string, PingHostConfig> = {
    'localhost': { ip: '127.0.0.1', baseTime: 0.1, variance: 0.1, ttl: 64 },
    '127.0.0.1': { ip: '127.0.0.1', baseTime: 0.1, variance: 0.1, ttl: 64 },
    'trustmail': { ip: '192.168.1.10', baseTime: 5, variance: 2, ttl: 64 },
    'trustmail.com': { ip: '192.168.1.10', baseTime: 5, variance: 2, ttl: 64 },
    'initech': { ip: '192.168.1.20', baseTime: 8, variance: 3, ttl: 64 },
    'initech.com': { ip: '192.168.1.20', baseTime: 8, variance: 3, ttl: 64 },
    'techcorp': { ip: '192.168.1.30', baseTime: 6, variance: 2, ttl: 64 },
    'techcorp.com': { ip: '192.168.1.30', baseTime: 6, variance: 2, ttl: 64 },
    'globalbank': { ip: '192.168.1.40', baseTime: 10, variance: 4, ttl: 64 },
    'globalbank.com': { ip: '192.168.1.40', baseTime: 10, variance: 4, ttl: 64 },
    'aurora': { ip: '127.0.0.1', baseTime: 0.1, variance: 0.1, ttl: 64 },
    'mainframe': { ip: '10.0.0.1', baseTime: 2, variance: 1, ttl: 64 },
};

function parsePingArgs(args: string[]): { count: number; interval: number; ttl: number; host: string | null } {
    let count = Infinity;
    let interval = 1;
    let ttl = 64;
    let host: string | null = null;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '-c' && i + 1 < args.length) {
            count = parseInt(args[++i], 10);
            if (isNaN(count) || count < 1) {
                count = Infinity;
            }
        } else if (arg === '-i' && i + 1 < args.length) {
            interval = parseFloat(args[++i]);
            if (isNaN(interval) || interval < 0.1) {
                interval = 1;
            }
        } else if (arg === '-t' && i + 1 < args.length) {
            ttl = parseInt(args[++i], 10);
            if (isNaN(ttl) || ttl < 1 || ttl > 255) {
                ttl = 64;
            }
        } else if (!arg.startsWith('-')) {
            host = arg;
        }
    }

    return { count, interval, ttl, host };
}

function simulateRTT(config: PingHostConfig): number {
    const min = Math.max(0.1, config.baseTime - config.variance);
    const max = config.baseTime + config.variance;
    return min + Math.random() * (max - min);
}

function simulateTTL(baseTtl: number): number {
    return baseTtl + Math.floor(Math.random() * 4) - 2;
}

export const ping: TerminalCommand = {
    name: 'ping',
    description: 'Send ICMP echo requests',
    usage: 'ping [-c count] [-i interval] host',
    execute: async ({ args }) => {
        const { count, interval, host } = parsePingArgs(args);

        if (!host) {
            return { output: ['ping: usage: ping [-c count] [-i interval] host'], error: true };
        }

        const normalizedHost = host.toLowerCase();
        const config = hostConfigs[normalizedHost];

        if (!config) {
            return { output: [`ping: bad address '${host}'`], error: true };
        }

        const output: string[] = [];

        output.push(`PING ${host} (${config.ip}): 56 data bytes`);

        let transmitted = 0;
        let received = 0;
        const rttValues: number[] = [];
        const aborted = false;

        const targetCount = count === Infinity ? 4 : count;

        for (let seq = 0; seq < targetCount && !aborted; seq++) {
            transmitted++;

            const rtt = simulateRTT(config);
            const actualTtl = simulateTTL(config.ttl);

            rttValues.push(rtt);
            received++;

            output.push(`64 bytes from ${config.ip}: icmp_seq=${seq} ttl=${actualTtl} time=${rtt.toFixed(3)} ms`);

            if (seq < targetCount - 1) {
                await new Promise(resolve => setTimeout(resolve, interval * 1000));
            }
        }

        if (rttValues.length === 0) {
            return { output, error: true };
        }

        output.push('');
        output.push(`--- ${host} ping statistics ---`);

        const loss = ((transmitted - received) / transmitted) * 100;
        const lossStr = loss === 0 ? '0.0' : loss.toFixed(1);

        output.push(`${transmitted} packets transmitted, ${received} packets received, ${lossStr}% packet loss`);

        if (rttValues.length > 0) {
            const min = Math.min(...rttValues);
            const avg = rttValues.reduce((a, b) => a + b, 0) / rttValues.length;
            const max = Math.max(...rttValues);

            output.push(`round-trip min/avg/max = ${min.toFixed(3)}/${avg.toFixed(3)}/${max.toFixed(3)} ms`);
        }

        return { output };
    },
};
