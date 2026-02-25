import { TerminalCommand } from '../types';

interface Hop {
    hopNum: number;
    ip: string;
    hostname: string;
    rtt1: number | null;
    rtt2: number | null;
    rtt3: number | null;
    isTimeout: boolean;
}

const simulatedHosts: Record<string, { ip: string; hops: string[]; hostnames: string[] }> = {
    'google.com': {
        ip: '142.250.185.78',
        hops: [
            '192.168.1.1',
            '10.0.0.1',
            '172.16.0.1',
            '68.1.1.1',
            '96.113.1.1',
            '4.68.63.1',
            '4.0.1.1',
            '142.250.1.1',
            '142.250.185.78'
        ],
        hostnames: [
            'router.local',
            'gateway.isp.net',
            'core-router.provider.com',
            'ae-1-0.pat1.mae-west1.bb.godaddy.com',
            '96.113.1.1',
            'be4.cr1.sjc-west1.bb.godaddy.com',
            'be6.cr1.lax1.bb.godaddy.com',
            '216.239.63.1',
            '142.250.185.78'
        ]
    },
    'cloudflare.com': {
        ip: '104.16.249.249',
        hops: [
            '192.168.1.1',
            '10.0.0.1',
            '172.16.0.1',
            '68.1.1.1',
            '96.113.1.1',
            '173.205.1.1',
            '104.16.249.249'
        ],
        hostnames: [
            'router.local',
            'gateway.isp.net',
            'core-router.provider.com',
            'ae1.pat1.mae-west1.bb.broadband.com',
            '96.113.1.1',
            'cloudflare.peer.as13458.net',
            '104.16.249.249'
        ]
    },
    'amazon.com': {
        ip: '52.94.76.10',
        hops: [
            '192.168.1.1',
            '10.0.0.1',
            '172.16.0.1',
            '68.1.1.1',
            '96.113.1.1',
            '15.230.1.1',
            '52.94.76.10'
        ],
        hostnames: [
            'router.local',
            'gateway.isp.net',
            'core-router.provider.com',
            'ae1.pat1.mae-west1.bb.comcast.net',
            '96.113.1.1',
            'aws-gateway.amazon.com',
            '52.94.76.10'
        ]
    },
    'github.com': {
        ip: '140.82.121.4',
        hops: [
            '192.168.1.1',
            '10.0.0.1',
            '172.16.0.1',
            '68.1.1.1',
            '96.113.1.1',
            '4.68.63.1',
            '4.0.1.1',
            '140.82.121.4'
        ],
        hostnames: [
            'router.local',
            'gateway.isp.net',
            'core-router.provider.com',
            'ae1.pat1.mae-west1.bb.godaddy.com',
            '96.113.1.1',
            'github.peer.as36459.net',
            '140.82.121.4'
        ]
    },
    'localhost': {
        ip: '127.0.0.1',
        hops: ['127.0.0.1'],
        hostnames: ['localhost']
    }
};

function generateRandomRtt(baseMs: number): number {
    return Math.round((baseMs + Math.random() * 10 - 5) * 1000) / 1000;
}

function generateHopData(
    targetIp: string,
    targetHostname: string,
    numHops: number,
    numericOnly: boolean
): Hop[] {
    const hops: Hop[] = [];
    const useSimulatedPath = Object.keys(simulatedHosts).some(
        host => targetIp === simulatedHosts[host].ip || host === targetHostname
    );

    let ipList: string[];
    let hostnameList: string[];

    if (useSimulatedPath) {
        const hostData = Object.values(simulatedHosts).find(h => h.ip === targetIp || simulatedHosts[targetHostname]?.ip === targetIp);
        if (hostData) {
            ipList = hostData.hops;
            hostnameList = hostData.hostnames;
        } else {
            ipList = simulatedHosts['google.com'].hops.slice(0, numHops);
            hostnameList = simulatedHosts['google.com'].hostnames.slice(0, numHops);
        }
    } else {
        ipList = [];
        hostnameList = [];
        for (let i = 0; i < numHops; i++) {
            if (i === 0) {
                ipList.push('192.168.1.1');
                hostnameList.push('router.local');
            } else if (i === 1) {
                ipList.push('10.0.0.1');
                hostnameList.push('gateway.isp.net');
            } else {
                const octet1 = 172 + Math.floor(Math.random() * 16);
                const octet2 = Math.floor(Math.random() * 16) + 16;
                ipList.push(`${octet1}.${octet2}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256) + 1}`);
                hostnameList.push(`router-${i}.provider.net`);
            }
        }
        ipList.push(targetIp);
        hostnameList.push(targetHostname);
    }

    for (let i = 0; i < Math.min(ipList.length, numHops); i++) {
        const isTimeout = Math.random() < 0.15;
        const baseRtt = 1 + i * 2;

        hops.push({
            hopNum: i + 1,
            ip: ipList[i],
            hostname: numericOnly ? ipList[i] : hostnameList[i],
            rtt1: isTimeout ? null : generateRandomRtt(baseRtt),
            rtt2: isTimeout ? null : generateRandomRtt(baseRtt + 0.5),
            rtt3: isTimeout ? null : generateRandomRtt(baseRtt + 1),
            isTimeout
        });
    }

    return hops;
}

function formatRtt(value: number | null): string {
    if (value === null) return '*';
    return `${value.toFixed(3)} ms`;
}

export const traceroute: TerminalCommand = {
    name: 'traceroute',
    description: 'Trace the route to a host',
    usage: 'traceroute [-n] host',
    execute: ({ args }) => {
        const numericOnly = args.includes('-n');
        const targetHost = args.find(arg => !arg.startsWith('-'));

        if (!targetHost) {
            return {
                output: ['Usage: traceroute [-n] host'],
                error: true
            };
        }

        let targetIp: string;
        let targetHostname: string;

        if (simulatedHosts[targetHost.toLowerCase()]) {
            const hostData = simulatedHosts[targetHost.toLowerCase()];
            targetIp = hostData.ip;
            targetHostname = targetHost.toLowerCase();
        } else if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(targetHost)) {
            targetIp = targetHost;
            targetHostname = targetHost;
        } else {
            const octet1 = Math.floor(Math.random() * 200) + 50;
            const octet2 = Math.floor(Math.random() * 256);
            const octet3 = Math.floor(Math.random() * 256);
            const octet4 = Math.floor(Math.random() * 256) + 1;
            targetIp = `${octet1}.${octet2}.${octet3}.${octet4}`;
            targetHostname = targetHost;
        }

        const maxHops = 30;
        const hopCount = Math.floor(Math.random() * 8) + 8;
        const hops = generateHopData(targetIp, targetHostname, hopCount, numericOnly);

        const output: string[] = [];
        output.push(`traceroute to ${targetHostname} (${targetIp}), ${maxHops} hops max, 60 byte packets`);

        hops.forEach(hop => {
            const hostnameDisplay = numericOnly ? hop.ip : hop.hostname;
            const ipDisplay = hop.ip;
            
            if (hop.isTimeout) {
                output.push(` ${hop.hopNum.toString().padStart(2)}  * * *`);
            } else {
                const line = ` ${hop.hopNum.toString().padStart(2)}  ${hostnameDisplay} (${ipDisplay})  ${formatRtt(hop.rtt1)}  ${formatRtt(hop.rtt2)}  ${formatRtt(hop.rtt3)}`;
                output.push(line);
            }
        });

        return { output };
    }
};
