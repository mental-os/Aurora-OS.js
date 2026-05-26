import { describe, it, expect } from "vitest";
import { createNpcFileSystem, NpcFsState } from "@/utils/npcFileSystem";
import { User, Group, FileNode } from "@/utils/fileSystemUtils";

/**
 * Regression coverage for issue #181 ("Weird Thing with the NPC").
 *
 * The NPC filesystem used to stub `verifyPassword: () => true`, so connecting
 * to an NPC accepted ANY password — e.g. the joke password "nugget" worked even
 * though the configured password was "654321". NPC auth must now behave exactly
 * like the local machine.
 */
describe("createNpcFileSystem.verifyPassword", () => {
  const buildState = (): NpcFsState => {
    const users: User[] = [
      // NPC root password is intentionally blank (crackable via game mechanics).
      {
        username: "root",
        password: "",
        uid: 0,
        gid: 0,
        fullName: "System Administrator",
        homeDir: "/root",
        shell: "/bin/bash",
      },
      // Mirrors the "soupik" NPC: user "nugget", password "654321".
      {
        username: "nugget",
        password: "654321",
        uid: 1000,
        gid: 1000,
        fullName: "nugget",
        homeDir: "/home/nugget",
        shell: "/bin/bash",
      },
    ];
    const groups: Group[] = [
      { groupName: "root", gid: 0, members: ["root"] },
      { groupName: "admin", gid: 10, members: ["nugget"] },
      { groupName: "nugget", gid: 1000, members: ["nugget"] },
    ];
    const fileSystem: FileNode = {
      id: "root",
      name: "/",
      type: "directory",
      children: [],
      owner: "root",
      permissions: "drwxr-xr-x",
    };
    return { fileSystem, users, groups };
  };

  const makeApi = () =>
    createNpcFileSystem(buildState(), "nugget", () => {});

  it("rejects an incorrect password instead of always accepting", () => {
    const api = makeApi();
    expect(api.verifyPassword("nugget", "nugget")).toBe(false);
    expect(api.verifyPassword("nugget", "wrong")).toBe(false);
    expect(api.verifyPassword("nugget", "")).toBe(false);
  });

  it("accepts the configured password", () => {
    const api = makeApi();
    expect(api.verifyPassword("nugget", "654321")).toBe(true);
  });

  it("treats a blank stored password as empty-only (NPC root)", () => {
    const api = makeApi();
    expect(api.verifyPassword("root", "")).toBe(true);
    expect(api.verifyPassword("root", "anything")).toBe(false);
  });

  it("preserves verification semantics through .as(user)", () => {
    const api = makeApi().as("root");
    expect(api.verifyPassword("nugget", "654321")).toBe(true);
    expect(api.verifyPassword("nugget", "nugget")).toBe(false);
  });
});
