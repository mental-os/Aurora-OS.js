import { TerminalCommand } from '../types';

export const history: TerminalCommand = {
    name: 'history',
    description: 'Show terminal command history',
    descriptionKey: 'terminal.commands.history.description',
    usage: 'history [-c] [-s|--search <pattern>] [-f|--favorites] [--favorite <n>] [--unfavorite <n>] [n]',
    usageKey: 'terminal.commands.history.usage',
    execute: ({ args, getCommandHistory, clearCommandHistory, getCommandFavorites, setCommandFavorite }) => {
        const commandHistory = getCommandHistory();
        const favorites = getCommandFavorites();

        const clearFlag = args.includes('-c');
        const searchFlag = args.includes('-s');
        const searchLongFlag = args.includes('--search');
        const favoritesFlag = args.includes('-f');
        const favoritesLongFlag = args.includes('--favorites');
        const favoriteFlag = args.includes('--favorite');
        const unfavoriteFlag = args.includes('--unfavorite');

        if (clearFlag) {
            clearCommandHistory();
            return { output: ['Command history cleared'] };
        }

        if (favoriteFlag) {
            const favIndex = args.indexOf('--favorite');
            const lineNum = args[favIndex + 1];
            if (!lineNum || isNaN(parseInt(lineNum, 10))) {
                return { output: ['Usage: history --favorite <n>'], error: true };
            }
            const lineNumber = parseInt(lineNum, 10);
            if (lineNumber < 1 || lineNumber > commandHistory.length) {
                return { output: [`history: ${lineNumber}: invalid history specification`], error: true };
            }
            setCommandFavorite(lineNumber, true);
            return { output: [`Command at line ${lineNumber} marked as favorite`] };
        }

        if (unfavoriteFlag) {
            const unfavIndex = args.indexOf('--unfavorite');
            const lineNum = args[unfavIndex + 1];
            if (!lineNum || isNaN(parseInt(lineNum, 10))) {
                return { output: ['Usage: history --unfavorite <n>'], error: true };
            }
            const lineNumber = parseInt(lineNum, 10);
            if (lineNumber < 1 || lineNumber > commandHistory.length) {
                return { output: [`history: ${lineNumber}: invalid history specification`], error: true };
            }
            setCommandFavorite(lineNumber, false);
            return { output: [`Command at line ${lineNumber} removed from favorites`] };
        }

        if (searchFlag || searchLongFlag) {
            const searchIndex = searchFlag ? args.indexOf('-s') : args.indexOf('--search');
            const pattern = args[searchIndex + 1];
            
            if (!pattern) {
                return { output: ['history: search pattern required'], error: true };
            }

            const regex = new RegExp(pattern, 'i');
            const matchingCommands: string[] = [];

            commandHistory.forEach((cmd, index) => {
                if (regex.test(cmd)) {
                    const lineNumber = index + 1;
                    const isFav = favorites.has(lineNumber);
                    const paddedNumber = lineNumber.toString().padStart(5, ' ');
                    const favMarker = isFav ? ' *  ' : '    ';
                    matchingCommands.push(`${paddedNumber}${favMarker}${cmd}`);
                }
            });

            if (matchingCommands.length === 0) {
                return { output: [`No commands matching pattern: ${pattern}`] };
            }

            return { output: matchingCommands };
        }

        if (favoritesFlag || favoritesLongFlag) {
            const favoriteCommands: string[] = [];

            commandHistory.forEach((cmd, index) => {
                const lineNumber = index + 1;
                if (favorites.has(lineNumber)) {
                    const paddedNumber = lineNumber.toString().padStart(5, ' ');
                    favoriteCommands.push(`${paddedNumber} *  ${cmd}`);
                }
            });

            if (favoriteCommands.length === 0) {
                return { output: ['No favorite commands'] };
            }

            return { output: favoriteCommands };
        }

        let limit = commandHistory.length;
        const numericArg = args.find(arg => !arg.startsWith('-') && !isNaN(parseInt(arg, 10)));

        if (numericArg) {
            const parsedLimit = parseInt(numericArg, 10);
            if (parsedLimit > 0) {
                limit = parsedLimit;
            }
        }

        if (commandHistory.length === 0) {
            return { output: [] };
        }

        const startIndex = Math.max(0, commandHistory.length - limit);
        const commandsToShow = commandHistory.slice(startIndex);

        const output = commandsToShow.map((cmd, index) => {
            const lineNumber = startIndex + index + 1;
            const isFav = favorites.has(lineNumber);
            const paddedNumber = lineNumber.toString().padStart(5, ' ');
            const favMarker = isFav ? ' *  ' : '    ';
            return `${paddedNumber}${favMarker}${cmd}`;
        });

        return { output };
    },
};
