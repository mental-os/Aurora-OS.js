import { TerminalCommand } from './types';
import { ls } from './commands/ls';
import { cd } from './commands/cd';
import { pwd } from './commands/pwd';
import { cat } from './commands/cat';
import { mkdir } from './commands/mkdir';
import { touch } from './commands/touch';
import { rm } from './commands/rm';
import { echo } from './commands/echo';
import { whoami } from './commands/whoami';
import { hostname } from './commands/hostname';
import { clear } from './commands/clear';
import { help } from './commands/helpCommand';
import { who } from './commands/who';
import { date } from './commands/date';
import { uptime } from './commands/uptime';
import { logout } from './commands/logout';
import { reset } from './commands/reset';
import { mv } from './commands/mv';
import { grep } from './commands/grep';
import { cp } from './commands/cp';
import { find } from './commands/find';
import { chmod } from './commands/chmod';
import { chown } from './commands/chown';
import { su } from './commands/su';
import { sudo } from './commands/sudo';
import { exit } from './commands/exit';

export const commands: Record<string, TerminalCommand> = {
    pwd,
    whoami,
    hostname,
    echo,
    clear,
    cd,
    mkdir,
    touch,
    rm,
    cat,
    ls,
    help,
    who,
    date,
    uptime,
    logout,
    reset,
    mv,
    grep,
    cp,
    find,
    chmod,
    chown,
    su,
    sudo,
    exit,
};

export function getCommand(name: string): TerminalCommand | undefined {
    return commands[name];
}

export function getAllCommands(): TerminalCommand[] {
    return Object.values(commands).sort((a, b) => a.name.localeCompare(b.name));
}
