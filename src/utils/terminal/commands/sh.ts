import { TerminalCommand, CommandContext, CommandResult } from '../types';

interface ShellState {
    variables: Record<string, string>;
    exitCode: number;
}

const expandVariables = (line: string, state: ShellState): string => {
    return line.replace(/\$\{?([a-zA-Z_][a-zA-Z0-9_]*)\}?/g, (_, name) => {
        return state.variables[name] !== undefined ? state.variables[name] : '';
    });
};

const parseCommandSubstitution = async (
    line: string,
    context: CommandContext
): Promise<{ result: string; exitCode: number }> => {
    const regex = /\$\(([^)]+)\)/g;
    let current = line;
    let lastExitCode = 0;

    const match = regex.exec(line);
    if (!match) {
        return { result: line, exitCode: 0 };
    }

    const cmd = match[1];
    const cmdToRun = context.allCommands.find(c => c.name === cmd.trim());

    if (cmdToRun) {
        const result = await cmdToRun.execute({
            ...context,
            args: [],
        });
        lastExitCode = result.error ? 1 : 0;
        const output = result.output.join('\n');
        current = line.replace(match[0], output);
    }

    return { result: current, exitCode: lastExitCode };
};

const executeLine = async (
    line: string,
    context: CommandContext,
    state: ShellState
): Promise<CommandResult> => {
    let output: (string | any)[] = [];
    let error = false;

    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
        return { output: [], error: false };
    }

    let expandedLine = expandVariables(trimmed, state);

    if (expandedLine.includes('$(')) {
        const { result, exitCode } = await parseCommandSubstitution(expandedLine, context);
        expandedLine = result;
        state.exitCode = exitCode;
    }

    const ifMatch = expandedLine.match(/^if\s+\[(.+)\]\s*;?\s*then$/);
    if (ifMatch) {
        const condition = ifMatch[1];
        const isTrue = evaluateCondition(condition, state, context);
        return { output: [], error: false, shouldExecuteBlock: isTrue, blockType: 'if' };
    }

    const elseMatch = expandedLine.match(/^else$/);
    if (elseMatch) {
        return { output: [], error: false, shouldExecuteBlock: false, blockType: 'else' };
    }

    const fiMatch = expandedLine.match(/^fi$/);
    if (fiMatch) {
        return { output: [], error: false, blockType: 'fi' };
    }

    const forMatch = expandedLine.match(/^for\s+(\w+)\s+in\s+(.+)\s*;?\s*do$/);
    if (forMatch) {
        const varName = forMatch[1];
        const items = forMatch[2].split(/\s+/);
        return { output: [], error: false, loopVariable: varName, loopItems: items, blockType: 'for' };
    }

    const doneMatch = expandedLine.match(/^done$/);
    if (doneMatch) {
        return { output: [], error: false, blockType: 'done' };
    }

    const assignmentMatch = expandedLine.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=(.+)$/);
    if (assignmentMatch) {
        const varName = assignmentMatch[1];
        let value = assignmentMatch[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        value = expandVariables(value, state);
        state.variables[varName] = value;
        return { output: [], error: false };
    }

    const echoMatch = expandedLine.match(/^echo\s+(.+)$/);
    if (echoMatch) {
        let text = echoMatch[1];
        text = expandVariables(text, state);
        if ((text.startsWith('"') && text.endsWith('"')) || 
            (text.startsWith("'") && text.endsWith("'"))) {
            text = text.slice(1, -1);
        }
        output.push(text);
        return { output, error: false };
    }

    const exitMatch = expandedLine.match(/^exit\s*(\d*)$/);
    if (exitMatch) {
        state.exitCode = exitMatch[1] ? parseInt(exitMatch[1], 10) : 0;
        return { output: [], error: false, shouldExit: true };
    }

    const cdMatch = expandedLine.match(/^cd\s+(.+)$/);
    if (cdMatch) {
        const cdCmd = context.allCommands.find(c => c.name === 'cd');
        if (cdCmd) {
            const targetPath = expandVariables(cdMatch[1].trim(), state);
            const result = await cdCmd.execute({
                ...context,
                args: [targetPath],
            });
            return result;
        }
    }

    const parts = expandedLine.split(/\s+/);
    const cmdName = parts[0];
    const args = parts.slice(1);

    const cmd = context.allCommands.find(c => c.name === cmdName);
    if (cmd) {
        const result = await cmd.execute({
            ...context,
            args,
        });
        state.exitCode = result.error ? 1 : 0;
        return result;
    }

    output.push(`${cmdName}: command not found`);
    error = true;
    state.exitCode = 127;

    return { output, error };
};

const evaluateCondition = (condition: string, state: ShellState, context: CommandContext): boolean => {
    const expanded = expandVariables(condition, state);
    
    const stringEqMatch = expanded.match(/^"([^"]+)"\s*=\s*"([^"]+)"$/);
    if (stringEqMatch) {
        return stringEqMatch[1] === stringEqMatch[2];
    }

    const stringNeqMatch = expanded.match(/^"([^"]+)"\s*!=\s*"([^"]+)"$/);
    if (stringNeqMatch) {
        return stringNeqMatch[1] !== stringNeqMatch[2];
    }

    const numEqMatch = expanded.match(/^(\d+)\s*-eq\s*(\d+)$/);
    if (numEqMatch) {
        return parseInt(numEqMatch[1], 10) === parseInt(numEqMatch[2], 10);
    }

    const numNeqMatch = expanded.match(/^(\d+)\s*-ne\s*(\d+)$/);
    if (numNeqMatch) {
        return parseInt(numNeqMatch[1], 10) !== parseInt(numNeqMatch[2], 10);
    }

    const numGtMatch = expanded.match(/^(\d+)\s*-gt\s*(\d+)$/);
    if (numGtMatch) {
        return parseInt(numGtMatch[1], 10) > parseInt(numGtMatch[2], 10);
    }

    const numLtMatch = expanded.match(/^(\d+)\s*-lt\s*(\d+)$/);
    if (numLtMatch) {
        return parseInt(numLtMatch[1], 10) < parseInt(numLtMatch[2], 10);
    }

    const fileExistsMatch = expanded.match(/^-f\s+(.+)$/);
    if (fileExistsMatch) {
        const path = expandVariables(fileExistsMatch[1], state);
        const node = context.getNodeAtPath(path);
        return node !== null && node !== undefined;
    }

    return expanded.length > 0;
};

export const sh: TerminalCommand = {
    name: 'sh',
    description: 'Shell interpreter',
    descriptionKey: 'terminal.commands.sh.description',
    usage: 'sh script.sh',
    usageKey: 'terminal.commands.sh.usage',
    execute: async (ctx: CommandContext): Promise<CommandResult> => {
        if (ctx.args.length === 0) {
            return { 
                output: ['Usage: sh script.sh'], 
                error: true 
            };
        }

        const scriptPath = ctx.resolvePath(ctx.args[0]);
        const scriptContent = ctx.readFile(scriptPath);

        if (!scriptContent) {
            const node = ctx.getNodeAtPath(scriptPath);
            if (node) {
                return { output: [`sh: ${ctx.args[0]}: Permission denied`], error: true };
            }
            return { output: [`sh: ${ctx.args[0]}: No such file or directory`], error: true };
        }

        const lines = scriptContent.split('\n');
        const output: (string | any)[] = [];
        const state: ShellState = {
            variables: {
                HOME: ctx.currentPath,
                PWD: ctx.currentPath,
                USER: ctx.terminalUser,
            },
            exitCode: 0,
        };

        let inIfBlock = false;
        let ifConditionTrue = false;
        let executeElse = false;
        let inForBlock = false;
        let forVariable = '';
        let forItems: string[] = [];
        let forBodyLines: string[] = [];
        let blockDepth = 0;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            if (line.trim().startsWith('#!')) continue;
            
            const ifMatch = line.trim().match(/^if\s+\[(.+)\]\s*;?\s*then$/);
            if (ifMatch) {
                inIfBlock = true;
                blockDepth++;
                const condition = ifMatch[1];
                ifConditionTrue = evaluateCondition(condition, state, ctx);
                executeElse = !ifConditionTrue;
                continue;
            }

            if (line.trim() === 'else' && inIfBlock) {
                executeElse = !executeElse;
                continue;
            }

            if (line.trim() === 'fi' && inIfBlock) {
                inIfBlock = false;
                blockDepth = 0;
                continue;
            }

            if (line.trim().startsWith('for ') && line.includes(' in ') && line.includes('; do')) {
                const forMatch = line.trim().match(/^for\s+(\w+)\s+in\s+(.+)\s*;?\s*do$/);
                if (forMatch) {
                    inForBlock = true;
                    forVariable = forMatch[1];
                    forItems = forMatch[2].split(/\s+/).map(item => 
                        expandVariables(item, state)
                    );
                    continue;
                }
            }

            if (line.trim() === 'done' && inForBlock) {
                for (const item of forItems) {
                    state.variables[forVariable] = item;
                    for (const bodyLine of forBodyLines) {
                        const result = await executeLine(bodyLine, ctx, state);
                        if (result.output.length > 0) {
                            output.push(...result.output);
                        }
                        if (result.shouldExit) {
                            return { output, error: state.exitCode !== 0 };
                        }
                    }
                }
                inForBlock = false;
                forBodyLines = [];
                continue;
            }

            if (inForBlock) {
                forBodyLines.push(line);
                continue;
            }

            if (inIfBlock) {
                if (executeElse) continue;
            }

            const result = await executeLine(line, ctx, state);
            
            if (result.output.length > 0) {
                output.push(...result.output);
            }

            if (result.shouldExit) {
                return { output, error: state.exitCode !== 0 };
            }

            if (result.newCwd) {
                ctx.setCurrentPath(result.newCwd);
            }
        }

        return { output, error: state.exitCode !== 0 };
    },
};
