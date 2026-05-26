import { TerminalCommand } from "@/utils/terminal/types";

export const exit: TerminalCommand = {
  name: "exit",
  description: "Exit the current shell session",
  descriptionKey: "terminal.commands.exit.description",
  execute: async ({
    closeSession,
    closeWindow,
    isRootSession,
    connectedTo,
    disconnect,
  }) => {
    // If connected to an NPC, disconnect first before doing anything else
    if (connectedTo) {
      disconnect();
      return { output: [] }; // Feedback printed by useTerminalLogic after state update
    }

    if (isRootSession) {
      if (closeWindow) {
        closeWindow();
        return { output: [] };
      }
      return { output: ["logout (no window context)"] };
    }

    closeSession();
    return { output: ["logout"] };
  },
};
