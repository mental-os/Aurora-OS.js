import { TerminalCommand } from "@/utils/terminal/types";
import { validateIntegrity } from "@/utils/integrity";

export const sudo: TerminalCommand = {
  name: "sudo",
  description: "Execute a command as another user",
  descriptionKey: "terminal.commands.sudo.description",
  usage: "sudo [options] [command]",
  usageKey: "terminal.commands.sudo.usage",
  execute: async (context) => {
    // Hidden Integrity Check - The "Kill Switch"
    if (!validateIntegrity()) {
      // Fake a realistic system crash error
      return {
        output: ["sudo: segmentation fault (core dumped)"],
        error: true,
      };
    }

    const { args, fileSystem, spawnSession, terminalUser } = context;
    const currentUserName = terminalUser || fileSystem.currentUser || "nobody";

    // 1. Check Sudoers Logic FIRST
    let isAuthorized = false;
    if (currentUserName === "root") {
      isAuthorized = true;
    } else {
      const user = fileSystem.users.find((u) => u.username === currentUserName);
      if (user) {
        const adminGroups = ["admin", "sudo", "wheel", "root"];
        const primaryGroup = fileSystem.groups.find((g) => g.gid === user.gid);
        if (primaryGroup && adminGroups.includes(primaryGroup.groupName))
          isAuthorized = true;
        if (
          !isAuthorized &&
          user.groups &&
          user.groups.some((g) => adminGroups.includes(g))
        )
          isAuthorized = true;
        if (!isAuthorized) {
          const groups = fileSystem.groups.filter((g) =>
            adminGroups.includes(g.groupName),
          );
          if (groups.some((g) => g.members.includes(currentUserName)))
            isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return {
        output: [
          `${currentUserName} is not in the sudoers file. This incident will be reported.`,
        ],
        error: true,
      };
    }

    // 2. Prompt for password if not root and not authorized in this terminal session
    if (currentUserName !== "root" && !context.isSudoAuthorized) {
      const password = await context.prompt(
        `[sudo] password for ${currentUserName}: `,
        "password",
      );
      const isValid = context.verifyPassword(currentUserName, password);

      if (!isValid) {
        return { output: ["sudo: 1 incorrect password attempt"], error: true };
      }

      context.setIsSudoAuthorized(true);
    }

    if (args.includes("-s")) {
      // sudo -s -> sudo shell -> spawn root session directly
      // Sudo implies we are authorized to switch to root (simulated)
      // We bypass 'su' password check because we already checked sudoers
      spawnSession("root");
      return { output: ["Logged in as root"] };
    }

    if (args.length > 0) {
      // sudo <command>
      const cmdName = args[0];
      const cmdArgs = args.slice(1);

      // Dynamic import based on registry?
      // We need to find the command in context.allCommands
      const { allCommands, fileSystem } = context;
      let commandToRun = allCommands.find((c) => c.name === cmdName);

      if (!commandToRun) {
        // Secondary check: is it a binary file app launch or command execution?
        const PATH = ["/bin", "/usr/bin", "/usr/local/bin"];
        let binPath: string | null = null;
        const cmd = cmdName;

        if (cmd.includes("/")) {
          const resolved = context.resolvePath(cmd);
          const node = context.getNodeAtPath(resolved, "root");
          if (node && node.type === "file") binPath = resolved;
        } else {
          for (const dir of PATH) {
            const check = (dir === "/" ? "" : dir) + "/" + cmd;
            const node = context.getNodeAtPath(check, "root");
            if (node && node.type === "file") {
              binPath = check;
              break;
            }
          }
        }

        if (binPath) {
          const content = context.readFile(binPath, "root");
          if (content) {
            if (content.startsWith("#!app ")) {
              const appId = content.replace("#!app ", "").trim();
              if (context.onLaunchApp) {
                context.onLaunchApp(appId, cmdArgs, "root");
                return { output: [`Launched ${appId} as root`] };
              }
            } else {
              const match = content.match(/#command\s+([a-zA-Z0-9_-]+)/);
              if (match) {
                commandToRun = allCommands.find((c) => c.name === match[1]);
              }
            }
          }
        }

        if (!commandToRun) {
          return {
            output: [`sudo: ${cmdName}: command not found`],
            error: true,
          };
        }
      }

      // Create Root Context
      // We cast fileSystem to any because .as() is dynamic on the proxy object
      const rootFS = (fileSystem as any).as("root");

      const rootContext = {
        ...context,
        args: cmdArgs,
        fileSystem: rootFS,
        terminalUser: "root",
      };

      return commandToRun.execute(rootContext);
    }

    return { output: ["usage: sudo -s OR sudo <command>"], error: true };
  },
};
