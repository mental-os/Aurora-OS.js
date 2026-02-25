import { TerminalCommand } from '../types';

interface CurlOptions {
    outputFile: string | null;
    headOnly: boolean;
    method: string;
    data: string | null;
    followRedirects: boolean;
    silent: boolean;
    url: string | null;
}

const supportedSites: Record<string, { content: string; contentType: string; status: number }> = {
    'api.github.com': {
        content: JSON.stringify({ name: "Aurora-OS", description: "A modern web-based operating system", stars: 1337 }, null, 2),
        contentType: 'application/json',
        status: 200
    },
    'httpbin.org/get': {
        content: JSON.stringify({ args: {}, headers: { Host: "httpbin.org" }, origin: "192.0.2.1", url: "https://httpbin.org/get" }, null, 2),
        contentType: 'application/json',
        status: 200
    },
    'jsonplaceholder.typicode.com/posts/1': {
        content: JSON.stringify({ userId: 1, id: 1, title: "sunt aut facere repellat provident occaecati excepturi optio reprehenderit", body: "lorem ipsum dolor sit amet" }, null, 2),
        contentType: 'application/json',
        status: 200
    },
    'example.com': {
        content: `<!DOCTYPE html>
<html>
<head>
    <title>Example Domain</title>
</head>
<body>
    <h1>Example Domain</h1>
    <p>This domain is for use in illustrative examples in documents.</p>
</body>
</html>`,
        contentType: 'text/html',
        status: 200
    }
};

function parseCurlArgs(args: string[]): CurlOptions {
    const options: CurlOptions = {
        outputFile: null,
        headOnly: false,
        method: 'GET',
        data: null,
        followRedirects: false,
        silent: false,
        url: null
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '-O') {
            options.outputFile = 'remote';
        } else if (arg === '-I') {
            options.headOnly = true;
        } else if (arg === '-X' && i + 1 < args.length) {
            options.method = args[++i].toUpperCase();
        } else if (arg === '-d' && i + 1 < args.length) {
            options.data = args[++i];
            if (options.method === 'GET') {
                options.method = 'POST';
            }
        } else if (arg === '-L') {
            options.followRedirects = true;
        } else if (arg === '-s') {
            options.silent = true;
        } else if (arg === '-o' && i + 1 < args.length) {
            options.outputFile = args[++i];
        } else if (!arg.startsWith('-') && !options.url) {
            options.url = arg;
        } else if (arg === '--help' || arg === '-h') {
            return { ...options, url: '--help' };
        }
    }

    return options;
}

function extractDomain(url: string): string {
    try {
        const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
        return urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
    } catch {
        return url;
    }
}

function generateResponseHeaders(status: number, contentType: string, contentLength: number): string[] {
    const statusText = status === 200 ? 'OK' : status === 301 ? 'Moved Permanently' : status === 302 ? 'Found' : status === 404 ? 'Not Found' : status === 500 ? 'Internal Server Error' : 'Unknown';
    
    return [
        `HTTP/1.1 ${status} ${statusText}`,
        'Server: Aurora-Sim/1.0',
        `Date: ${new Date().toUTCString()}`,
        `Content-Type: ${contentType}; charset=utf-8`,
        `Content-Length: ${contentLength}`,
        'Connection: keep-alive',
        'Access-Control-Allow-Origin: *',
        ''
    ];
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes.toString();
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'K';
    return (bytes / (1024 * 1024)).toFixed(1) + 'M';
}

export const curl: TerminalCommand = {
    name: 'curl',
    description: 'Transfer data from/to a server',
    usage: 'curl [-O] [-I] [-X method] url',
    execute: async ({ args, fileSystem, resolvePath }) => {
        const options = parseCurlArgs(args);

        if (!options.url || options.url === '--help') {
            return {
                output: [
                    'curl: try \'curl --help\' for more information',
                    'Usage: curl [OPTION]... URL',
                    '  -o, --output FILE        write to FILE instead of stdout',
                    '  -O, --remote-name        write output to a file named as remote file',
                    '  -I, --head               fetch headers only',
                    '  -X, --request METHOD     specify request method',
                    '  -d, --data DATA          HTTP POST data',
                    '  -L, --location           follow redirects',
                    '  -s, --silent             silent mode'
                ],
                error: true
            };
        }

        const url = options.url.startsWith('http') ? options.url : `http://${options.url}`;
        const domain = extractDomain(url);

        const output: string[] = [];

        if (!options.silent) {
            output.push(`  % Total    % Received    % Xferd  Average Speed   Time    Time     Time  Current`);
            output.push(`                                 Dload  Upload   Total   Spent    Left  Speed`);
        }

        output.push(`*   Trying 192.0.2.1:80...`);
        output.push(`* Connected to ${domain.split('/')[0]} (192.0.2.1) port 80 (#0)`);

        if (options.followRedirects) {
            output.push(`> GET / HTTP/1.1`);
            output.push(`> Host: ${domain.split('/')[0]}`);
            output.push(`> User-Agent: Aurora-OS curl/1.0`);
            output.push(`> Accept: */*`);
            output.push(`>`);
        } else {
            output.push(`> ${options.method} / HTTP/1.1`);
            output.push(`> Host: ${domain.split('/')[0]}`);
            output.push(`> User-Agent: Aurora-OS curl/1.0`);
            output.push(`> Accept: */*`);
            
            if (options.data) {
                output.push(`> Content-Type: application/x-www-form-urlencoded`);
                output.push(`> Content-Length: ${options.data.length}`);
                output.push(`> ${options.data}`);
            }
            output.push(`>`);
        }

        const supportedContent = supportedSites[domain];
        let status = 200;
        let contentType = 'text/html';
        let body = '';

        if (supportedContent) {
            status = supportedContent.status;
            contentType = supportedContent.contentType;
            body = supportedContent.content;
        } else {
            const knownDomains = ['api.github.com', 'httpbin.org', 'jsonplaceholder.typicode.com', 'example.com'];
            const isKnown = knownDomains.some(d => domain.includes(d));
            
            if (isKnown) {
                status = 200;
                contentType = 'application/json';
                body = JSON.stringify({ message: `Simulated response from ${domain}` }, null, 2);
            } else {
                status = 404;
                body = `<!DOCTYPE html>
<html>
<head><title>404 Not Found</title></head>
<body>
<h1>Not Found</h1>
<p>The requested URL was not found on this server.</p>
</body>
</html>`;
            }
        }

        const headers = generateResponseHeaders(status, contentType, body.length);

        if (options.headOnly) {
            headers.forEach(h => output.push(h));
            if (!options.silent) {
                output.push(``);
                output.push(`HTTP/1.1 ${status} ${headers[0].split(' ')[1]}`);
                output.push(`  Total    : ${body.length}`);
                output.push(`  Speed    : 12345678`);
            }
            return { output };
        }

        headers.forEach(h => output.push(h));
        output.push(body);

        if (!options.silent) {
            const time = (Math.random() * 0.5 + 0.1).toFixed(3);
            const speed = Math.floor(body.length / parseFloat(time));
            
            output.push('');
            output.push(`  % Total    % Received    % Xferd  Average Speed   Time    Time     Time  Current`);
            output.push(`                                 Dload  Upload   Total   Spent    Left  Speed`);
            output.push(`100 ${body.length}  100 ${body.length}    0     0  ${body.length}      0 --:--:--:--  ${speed}`);
            output.push('');
            output.push(`Total bytes received: ${body.length}`);
            output.push(`Transfer speed: ~${formatBytes(speed)}/s`);
            output.push(`Time total: ${time}s`);
        }

        if (options.outputFile) {
            let fileName: string;
            
            if (options.outputFile === 'remote') {
                const pathParts = domain.split('/');
                fileName = pathParts[pathParts.length - 1] || 'index.html';
                if (!fileName.includes('.')) {
                    fileName = 'index.html';
                }
            } else {
                fileName = options.outputFile;
            }

            const savePath = resolvePath(fileName);
            
            const parentPath = savePath.substring(0, savePath.lastIndexOf('/'));
            const parentNode = fileSystem.getNodeAtPath(parentPath || '/');
            
            if (parentNode && parentNode.type === 'directory') {
                const success = fileSystem.createFile(parentPath, fileName, body);
                if (success) {
                    output.push(`  % Saved to ${fileName}`);
                } else {
                    output.push(`curl: couldn't save to '${fileName}': Permission denied`);
                }
            } else {
                output.push(`curl: couldn't save to '${fileName}': No such directory`);
            }
        }

        return { output };
    },
};
