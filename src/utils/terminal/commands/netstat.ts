import { TerminalCommand, CommandContext } from '../types';

interface NetworkConnection {
    proto: string;
    localAddress: string;
    foreignAddress: string;
    state: string;
    recvQ: number;
    sendQ: number;
}

const COMMON_PORTS = [22, 80, 443, 631, 3306, 5432, 3000, 8080];

const generateConnections = (showTcp: boolean, showUdp: boolean): NetworkConnection[] => {
    const connections: NetworkConnection[] = [];
    const localIPs = ['0.0.0.0', '127.0.0.1', '192.168.1.5'];

    if (showTcp) {
        COMMON_PORTS.forEach(port => {
            localIPs.forEach((localIp) => {
                if (localIp === '0.0.0.0' || localIp === '192.168.1.5') {
                    connections.push({
                        proto: 'tcp',
                        localAddress: `${localIp}:${port}`,
                        foreignAddress: '0.0.0.0:*',
                        state: 'LISTEN',
                        recvQ: 0,
                        sendQ: 0,
                    });
                }
                if (localIp === '127.0.0.1' && (port === 631 || port === 3306 || port === 5432)) {
                    connections.push({
                        proto: 'tcp',
                        localAddress: `127.0.0.1:${port}`,
                        foreignAddress: '0.0.0.0:*',
                        state: 'LISTEN',
                        recvQ: 0,
                        sendQ: 0,
                    });
                }
            });
        });

        connections.push({
            proto: 'tcp',
            localAddress: '192.168.1.5:443',
            foreignAddress: '142.250.185.78:52341',
            state: 'ESTABLISHED',
            recvQ: 0,
            sendQ: 0,
        });
        connections.push({
            proto: 'tcp',
            localAddress: '192.168.1.5:22',
            foreignAddress: '192.168.1.100:54321',
            state: 'ESTABLISHED',
            recvQ: 0,
            sendQ: 128,
        });
        connections.push({
            proto: 'tcp',
            localAddress: '192.168.1.5:80',
            foreignAddress: '172.217.14.206:443',
            state: 'TIME_WAIT',
            recvQ: 0,
            sendQ: 0,
        });
        connections.push({
            proto: 'tcp',
            localAddress: '192.168.1.5:3306',
            foreignAddress: '10.0.0.50:45231',
            state: 'ESTABLISHED',
            recvQ: 0,
            sendQ: 0,
        });
        connections.push({
            proto: 'tcp',
            localAddress: '192.168.1.5:5432',
            foreignAddress: '192.168.1.100:54322',
            state: 'CLOSE_WAIT',
            recvQ: 0,
            sendQ: 0,
        });
    }

    if (showUdp) {
        connections.push({
            proto: 'udp',
            localAddress: '0.0.0.0:68',
            foreignAddress: '0.0.0.0:*',
            state: '',
            recvQ: 0,
            sendQ: 0,
        });
        connections.push({
            proto: 'udp',
            localAddress: '0.0.0.0:53',
            foreignAddress: '0.0.0.0:*',
            state: '',
            recvQ: 0,
            sendQ: 0,
        });
        connections.push({
            proto: 'udp',
            localAddress: '127.0.0.1:631',
            foreignAddress: '0.0.0.0:*',
            state: '',
            recvQ: 0,
            sendQ: 0,
        });
    }

    return connections;
};

const formatAddress = (addr: string, numeric: boolean): string => {
    if (numeric) return addr;
    return addr;
};

export const netstat: TerminalCommand = {
    name: 'netstat',
    description: 'Print network connections',
    usage: 'netstat [-tuln] [-a]',
    execute: (context: CommandContext) => {
        const { args } = context;
        
        let showTcp = false;
        let showUdp = false;
        let showListening = false;
        let showAll = false;
        let numeric = false;

        args.forEach(arg => {
            if (arg.startsWith('-')) {
                const flags = arg.slice(1);
                if (flags.includes('t')) showTcp = true;
                if (flags.includes('u')) showUdp = true;
                if (flags.includes('l')) showListening = true;
                if (flags.includes('n')) numeric = true;
                if (flags.includes('a')) showAll = true;
            }
        });

        if (!showTcp && !showUdp) {
            showTcp = true;
            showUdp = true;
        }

        if (!showListening && !showAll) {
            showListening = true;
        }

        const allConnections = generateConnections(showTcp, showUdp);
        
        let filteredConnections = allConnections;
        if (showListening && !showAll) {
            filteredConnections = allConnections.filter(c => c.state === 'LISTEN' || c.state === '');
        } else if (showAll) {
            filteredConnections = allConnections;
        } else {
            filteredConnections = allConnections.filter(c => c.state !== 'LISTEN' && c.state !== '');
        }

        const output: string[] = [];
        
        const protoLabel = showTcp && showUdp ? 'Active Internet connections' : 
                          showTcp ? 'Active TCP connections' : 'Active UDP connections';
        const serverLabel = showListening || showAll ? '(servers and established)' : '(established)';
        output.push(`${protoLabel} ${serverLabel}`);
        output.push('');
        
        const header = 'Proto Recv-Q Send-Q Local Address           Foreign Address         State       ';
        output.push(header);

        filteredConnections.forEach(conn => {
            const proto = conn.proto.padEnd(5);
            const recvQ = String(conn.recvQ).padEnd(7);
            const sendQ = String(conn.sendQ).padEnd(7);
            const localAddr = formatAddress(conn.localAddress, numeric).padEnd(22);
            const foreignAddr = formatAddress(conn.foreignAddress, numeric).padEnd(22);
            const state = conn.state.padEnd(11);
            
            output.push(`${proto}${recvQ}${sendQ}${localAddr}${foreignAddr}${state}`);
        });

        output.push('');
        
        const tcpCount = filteredConnections.filter(c => c.proto === 'tcp').length;
        const udpCount = filteredConnections.filter(c => c.proto === 'udp').length;
        const listenCount = filteredConnections.filter(c => c.state === 'LISTEN').length;
        const estCount = filteredConnections.filter(c => c.state === 'ESTABLISHED').length;
        
        output.push(`Raw socket table                     `);
        output.push(`Proto RefCnt Flags       Type       State       I-O Node Name`);
        if (showTcp) output.push(`tcp        0 0 [00000000] 00000000     00000000    0        0 ${tcpCount} 0`);
        if (showUdp) output.push(`udp        0 0 [00000000] 00000000     00000000    0        0 ${udpCount} 0`);
        output.push('');
        output.push(`Total connections: ${filteredConnections.length} (TCP: ${tcpCount}, UDP: ${udpCount})`);
        output.push(`Listening sockets: ${listenCount}`);
        output.push(`Established connections: ${estCount}`);

        return { output };
    },
};
