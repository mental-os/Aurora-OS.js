/**
 * WorldContext — NPC Computer Runtime Manager
 *
 * Manages the lifecycle of all NPC computers in the game world:
 * - Provisioning (first-time setup from npcRegistry templates)
 * - Persistent state (load/save from memory via os_npc_<originalIP>)
 * - Runtime identity (currentIP / currentHostname — mutable, originalIP is immutable)
 * - Filesystem API bridge (getNpcApi → used to swap terminal context on connect)
 * - RAM gate (canNpcLaunchApp — same logic as player's useWindowManager)
 *
 * Architecture:
 * - WorldProvider sits inside FileSystemProvider in App.tsx
 * - spawnNpcs() is called by GameRoot on BOTH onboarding complete AND on every boot
 *   (idempotent — skips already-loaded, just hydrates from persisted storage)
 * - hardReset() automatically wipes all os_npc_* keys (Tier 2 HDD prefix)
 */

import {
  createContext,
  useContext,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import {
  NPC_REGISTRY,
  type NPCTemplate,
  type NPCLoreFile,
  type NPCCustomNode,
} from "@/config/npcRegistry";
import { STORAGE_KEYS, memory } from "@/utils/memory";
import {
  initialFileSystem,
  createUserHome,
  ensureIds,
  formatPasswd,
  formatGroup,
  type FileNode,
  type User,
  type Group,
} from "@/utils/fileSystemUtils";
import { getApp, getCoreApps } from "@/config/appRegistry";
import {
  createNpcFileSystem,
  type NpcFileSystemApi,
  type NpcFsState,
} from "@/utils/npcFileSystem";
import { safeParseLocal } from "@/utils/safeStorage";

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

/** Mutable runtime state for a provisioned NPC */
interface NpcRuntimeState {
  originalIP: string;
  currentIP: string;
  currentHostname: string;
  /** App IDs currently running on this NPC (for RAM tracking) */
  runningAppIds: string[];
  /** Live VFS for this NPC */
  fileSystem: FileNode;
  users: User[];
  groups: Group[];
}

/** Shape written to / read from localStorage */
interface PersistedNpcState {
  originalIP: string;
  currentIP: string;
  currentHostname: string;
  runningAppIds: string[];
  fileSystem: unknown; // raw JSON — Date fields are strings
  users: User[];
  groups: Group[];
}

export interface WorldContextType {
  /** Provision or reload all NPCs from the registry (idempotent). Call on boot AND after onboarding. */
  spawnNpcs: () => void;
  /**
   * Resolve a string (IP or hostname) to a provisioned NPC runtime state.
   * Searches by currentIP OR currentHostname so renamed NPCs are still found.
   */
  resolveNpcTarget: (input: string) => NpcRuntimeState | null;
  /** Get a FileSystemContextType-compatible API for an NPC, identified by currentIP. */
  getNpcApi: (ip: string) => NpcFileSystemApi | null;
  /** Check if an NPC can launch an app given its RAM budget. */
  canNpcLaunchApp: (
    ip: string,
    appId: string,
  ) => { allowed: boolean; reason?: string };
  /** Register a running app on the NPC (call when a remote window opens). */
  registerNpcProcess: (ip: string, appId: string) => void;
  /** Unregister a running app on the NPC (call when a remote window closes). */
  unregisterNpcProcess: (ip: string, appId: string) => void;
  /** Get all provisioned NPC runtime states. */
  getAllNpcs: () => NpcRuntimeState[];
}

// ─────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────

const WorldContext = createContext<WorldContextType | null>(null);

export function useWorldContext(): WorldContextType {
  const ctx = useContext(WorldContext);
  if (!ctx)
    throw new Error("useWorldContext must be used inside <WorldProvider>");
  return ctx;
}

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

/**
 * Deep-clone the initial filesystem and strip the /usr/bin app launchers.
 * NPC gets only its explicitly installed apps — not everything from getCoreApps().
 * Also strips player-specific dynamic content (wallpaper refs, etc.) from /etc.
 */
function buildCleanNpcFs(): FileNode {
  const fs: FileNode = JSON.parse(JSON.stringify(initialFileSystem));

  // Clear /usr/bin — NPC gets only its explicitly installed apps
  const usr = fs.children?.find((c) => c.name === "usr");
  const usrBin = usr?.children?.find((c) => c.name === "bin");
  if (usrBin) usrBin.children = [];

  return fs;
}

/**
 * Revive `Date` fields that become strings after JSON.parse.
 * FileNode.modified is typed as Date but serializes to ISO string.
 * Without this, `node.modified instanceof Date` is false after hydration.
 */
function reviveFilesystem(node: unknown): FileNode {
  const n = node as FileNode;
  if (n.modified && typeof n.modified === "string") {
    n.modified = new Date(n.modified);
  }
  if (n.children) {
    n.children = n.children.map(reviveFilesystem);
  }
  return n;
}

/** Build the passwd and group file content for an NPC's user set */
function buildNpcUsers(template: NPCTemplate): {
  users: User[];
  groups: Group[];
  passwdContent: string;
  groupContent: string;
} {
  // Root password is intentionally blank — NPCs should be secured by network isolation.
  // The player can crack root access via the game's hacking mechanics.
  const rootUser: User = {
    username: "root",
    password: "",
    uid: 0,
    gid: 0,
    fullName: "System Administrator",
    homeDir: "/root",
    shell: "/bin/bash",
  };
  const guestUser: User = {
    username: "guest",
    password: "guest",
    uid: 1001,
    gid: 1001,
    fullName: "Guest",
    homeDir: "/home/guest",
    shell: "/bin/bash",
  };
  const mainUser: User = {
    username: template.mainUser,
    password: template.mainUserPassword ?? "",
    uid: 1000,
    gid: 1000,
    fullName: template.mainUser,
    homeDir: `/home/${template.mainUser}`,
    shell: "/bin/bash",
  };

  const users = [rootUser, guestUser, mainUser];

  const groups: Group[] = [
    { groupName: "root", gid: 0, members: ["root"] },
    { groupName: "users", gid: 100, members: [template.mainUser, "guest"] },
    { groupName: "admin", gid: 10, members: [template.mainUser] },
    { groupName: "guest", gid: 1001, members: ["guest"] },
    { groupName: template.mainUser, gid: 1000, members: [template.mainUser] },
  ];

  return {
    users,
    groups,
    passwdContent: formatPasswd(users),
    groupContent: formatGroup(groups),
  };
}

/**
 * Derive correct owner and permissions for a lore node based on its path and type.
 * Mirrors the logic in createUserHome() and the initial filesystem.
 */
function deriveLoreMetadata(
  absolutePath: string,
  isDirectory: boolean,
): { owner: string; permissions: string } {
  if (absolutePath.startsWith("/root")) {
    return {
      owner: "root",
      permissions: isDirectory ? "drwx------" : "-rw-------",
    };
  }
  const homeMatch = absolutePath.match(/^\/home\/([^/]+)/);
  if (homeMatch) {
    return {
      owner: homeMatch[1],
      permissions: isDirectory ? "drwxr-xr-x" : "-rw-r--r--",
    };
  }
  return {
    owner: "root",
    permissions: isDirectory ? "drwxr-xr-x" : "-rw-r--r--",
  };
}

/**
 * Write a hierarchical custom node tree at an absolute VFS path.
 */
function writeAbsolutePath(fs: FileNode, lore: NPCLoreFile): void {
  const parts = lore.path.split("/").filter(Boolean);
  const anchorName = parts.pop();
  if (!anchorName) return;

  let current = fs;
  const currentPathParts: string[] = [];

  // 1. Navigate/Create intermediate directories
  for (const part of parts) {
    currentPathParts.push(part);
    let next = current.children?.find((c) => c.name === part);
    if (!next) {
      const partPath = "/" + currentPathParts.join("/");
      const { owner: dirOwner, permissions: dirPerms } = deriveLoreMetadata(
        partPath,
        true,
      );
      next = {
        id: crypto.randomUUID(),
        name: part,
        type: "directory",
        children: [],
        owner: dirOwner,
        permissions: dirPerms,
        modified: new Date(),
      };
      if (!current.children) current.children = [];
      current.children.push(next);
    }
    if (next.type !== "directory") return;
    current = next;
  }

  // 2. Provision the anchor node and its descendants
  provisionCustomNode(
    current,
    {
      name: anchorName,
      type: "file", // Default to file if not specified
      ...lore,
    },
    lore.path,
  );
}

/**
 * Recursively applies a custom node configuration to the VFS.
 */
function provisionCustomNode(
  parent: FileNode,
  config: NPCCustomNode,
  absolutePath: string,
): void {
  if (!parent.children) parent.children = [];

  let node = parent.children.find((c) => c.name === config.name);
  const isDir = config.type === "directory";
  const { owner: defOwner, permissions: defPerms } = deriveLoreMetadata(
    absolutePath,
    isDir,
  );

  if (!node) {
    node = {
      id: crypto.randomUUID(),
      name: config.name,
      type: config.type,
      owner: config.owner ?? defOwner,
      permissions: config.permissions ?? defPerms,
      modified: new Date(),
    };
    parent.children.push(node);
  } else {
    // Update metadata if explicitly provided in template
    if (config.owner) node.owner = config.owner;
    if (config.permissions) node.permissions = config.permissions;
    node.modified = new Date();
  }

  if (config.type === "file") {
    const fileContent = config.content ?? "";
    node.content = fileContent;
    // RESOLVED: Use provided size or derive from content
    node.size = config.size ?? fileContent.length;
  } else if (isDir) {
    if (!node.children) node.children = [];
    if (config.children) {
      for (const child of config.children) {
        const childPath = `${absolutePath}/${child.name}`.replace(/\/+/g, "/");
        provisionCustomNode(node, child, childPath);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────

export function WorldProvider({ children }: { children: ReactNode }) {
  /**
   * In-memory mapping: originalIP → NpcRuntimeState (mutable object)
   * This is the single source of truth. Persisted to memory after every mutation.
   */
  const npcStateMap = useRef<Map<string, NpcRuntimeState>>(new Map());

  /**
   * NPC filesystem API cache: originalIP → NpcFileSystemApi
   * An API instance holds a closure over the state object — mutations stay visible.
   * Cache is invalidated when a mutation changes the users/groups (writeFile to /etc/passwd).
   */
  const npcApiCache = useRef<Map<string, NpcFileSystemApi>>(new Map());

  const storageKey = (originalIP: string) =>
    `${STORAGE_KEYS.NPC_STATE_PREFIX}${originalIP}`;

  /** Persist a single NPC's state to memory */
  const persistNpc = useCallback((state: NpcRuntimeState) => {
    memory.setItem(
      storageKey(state.originalIP),
      JSON.stringify({
        originalIP: state.originalIP,
        currentIP: state.currentIP,
        currentHostname: state.currentHostname,
        runningAppIds: state.runningAppIds,
        fileSystem: state.fileSystem,
        users: state.users,
        groups: state.groups,
      }),
    );
  }, []);

  /**
   * Invalidate the API cache for an NPC.
   * Called when users/groups change (so the next getNpcApi() call re-creates
   * the factory with the new state). The state object itself is shared by ref,
   * so fileSystem/content mutations don't require cache invalidation.
   */
  const invalidateApi = useCallback((originalIP: string) => {
    npcApiCache.current.delete(originalIP);
  }, []);

  /** Build or recover a single NPC from storage */
  const loadOrProvisionNpc = useCallback(
    (template: NPCTemplate): NpcRuntimeState => {
      const key = storageKey(template.originalIP);
      const saved = safeParseLocal<PersistedNpcState>(key);

      if (saved && saved.fileSystem) {
        try {
          return {
            originalIP: saved.originalIP,
            currentIP: saved.currentIP,
            currentHostname: saved.currentHostname,
            // Safely clear runningAppIds on reload — app windows don't survive restart
            runningAppIds: [],
            fileSystem: reviveFilesystem(saved.fileSystem),
            users: saved.users,
            groups: saved.groups,
          };
        } catch {
          // Corrupted save — fall through to fresh provision
          console.warn(
            `[WorldContext] Corrupted NPC save for ${template.originalIP}, re-provisioning.`,
          );
        }
      }

      // ── PROVISIONING ────────────────────────────────────────────────────
      const fs = buildCleanNpcFs();
      const { users, groups, passwdContent, groupContent } =
        buildNpcUsers(template);

      // System files — overwrite the player defaults from initialFileSystem
      writeAbsolutePath(fs, { path: "/etc/passwd", content: passwdContent });
      writeAbsolutePath(fs, { path: "/etc/group", content: groupContent });
      writeAbsolutePath(fs, {
        path: "/etc/hostname",
        content: template.hostname,
      });

      // Main user home directory (uses the standardized createUserHome utility)
      const homeNode = ensureIds(createUserHome(template.mainUser));
      const homeDirNode = fs.children?.find((c) => c.name === "home");
      if (homeDirNode?.children) {
        homeDirNode.children = homeDirNode.children.filter(
          (c) => c.name !== template.mainUser,
        );
        homeDirNode.children.push(homeNode);
      }

      // Seed /usr/bin with base apps (from registry) + explicitly installed apps
      const usrBin = fs.children
        ?.find((c) => c.name === "usr")
        ?.children?.find((c) => c.name === "bin");
      if (usrBin) {
        const registryCoreApps = getCoreApps().map((app) => app.id);
        const allApps = Array.from(
          new Set([...registryCoreApps, ...template.installedApps]),
        );

        usrBin.children = allApps.map((appId) => ({
          id: crypto.randomUUID(),
          name: appId,
          type: "file" as const,
          content: `#!app ${appId}`,
          size: `#!app ${appId}`.length,
          owner: "root",
          permissions: "-rwxr-xr-x",
          modified: new Date(),
        }));
      }

      // Lore files — path determines ownership and permissions automatically
      for (const loreFile of template.loreFiles) {
        writeAbsolutePath(fs, loreFile);
      }

      const state: NpcRuntimeState = {
        originalIP: template.originalIP,
        currentIP: template.originalIP,
        currentHostname: template.hostname,
        runningAppIds: [],
        fileSystem: fs,
        users,
        groups,
      };

      persistNpc(state);
      return state;
    },
    [persistNpc],
  );

  // ── PUBLIC API ─────────────────────────────────────────────────────────

  /**
   * Provision or reload all NPC computers.
   * Safe to call multiple times — already-loaded NPCs are skipped.
   * Must be called on every boot (not just new game) to hydrate from storage.
   */
  const spawnNpcs = useCallback(() => {
    for (const template of NPC_REGISTRY) {
      if (!npcStateMap.current.has(template.originalIP)) {
        const state = loadOrProvisionNpc(template);
        npcStateMap.current.set(template.originalIP, state);
      }
    }
  }, [loadOrProvisionNpc]);

  const resolveNpcTarget = useCallback(
    (input: string): NpcRuntimeState | null => {
      for (const state of npcStateMap.current.values()) {
        if (state.currentIP === input || state.currentHostname === input)
          return state;
      }
      return null;
    },
    [],
  );

  const getNpcApi = useCallback(
    (ip: string): NpcFileSystemApi | null => {
      let targetState: NpcRuntimeState | null = null;
      for (const state of npcStateMap.current.values()) {
        if (state.currentIP === ip) {
          targetState = state;
          break;
        }
      }
      if (!targetState) return null;

      const { originalIP } = targetState;

      if (npcApiCache.current.has(originalIP)) {
        return npcApiCache.current.get(originalIP)!;
      }

      // The `stateRef` is the actual mutable NpcRuntimeState object.
      // createNpcFileSystem accepts NpcFsState (subset of NpcRuntimeState),
      // but we pass the full object — JS structural typing means this works
      // since NpcRuntimeState has all the required NpcFsState keys.
      const stateRef = targetState;
      const npcFsState: NpcFsState = stateRef; // structurally compatible

      const mainUser =
        stateRef.users.find((u) => u.uid === 1000)?.username ?? "guest";

      const api = createNpcFileSystem(
        npcFsState,
        mainUser,
        (newFs, newUsers, newGroups) => {
          stateRef.fileSystem = newFs;
          if (newUsers) stateRef.users = newUsers;
          if (newGroups) stateRef.groups = newGroups;
          persistNpc(stateRef);
          // Only invalidate if users/groups changed (API holds live state refs for FS)
          if (newUsers || newGroups) {
            invalidateApi(originalIP);
          }
        },
        (newHostname) => {
          stateRef.currentHostname = newHostname;
          persistNpc(stateRef);
        },
      );

      npcApiCache.current.set(originalIP, api);
      return api;
    },
    [persistNpc, invalidateApi],
  );

  const canNpcLaunchApp = useCallback(
    (ip: string, appId: string): { allowed: boolean; reason?: string } => {
      let targetState: NpcRuntimeState | null = null;
      for (const state of npcStateMap.current.values()) {
        if (state.currentIP === ip) {
          targetState = state;
          break;
        }
      }
      if (!targetState) return { allowed: false, reason: "NPC not found" };

      const template = NPC_REGISTRY.find(
        (t) => t.originalIP === targetState!.originalIP,
      );
      if (!template)
        return { allowed: false, reason: "NPC template not found" };

      const appDef = getApp(appId);
      if (!appDef)
        return { allowed: false, reason: `App '${appId}' is not registered` };

      const ramLimitMB = template.memoryGB * 1024;
      const usedMB = targetState.runningAppIds.reduce((acc, id) => {
        const app = getApp(id);
        return acc + (app?.ramUsage ?? 0);
      }, 0);

      // Mirror ACTIVE_SESSION_BASE_RAM from resourceMonitor.ts
      const BASE_RAM_MB = 512;
      const projectedTotal = usedMB + BASE_RAM_MB + (appDef.ramUsage ?? 0);

      if (projectedTotal > ramLimitMB) {
        return {
          allowed: false,
          reason: `Not enough RAM: need ${appDef.ramUsage}MB, available ${ramLimitMB - usedMB - BASE_RAM_MB}MB`,
        };
      }

      return { allowed: true };
    },
    [],
  );

  const registerNpcProcess = useCallback((ip: string, appId: string) => {
    for (const state of npcStateMap.current.values()) {
      if (state.currentIP === ip) {
        state.runningAppIds = [...state.runningAppIds, appId];
        break;
      }
    }
  }, []);

  const unregisterNpcProcess = useCallback((ip: string, appId: string) => {
    for (const state of npcStateMap.current.values()) {
      if (state.currentIP === ip) {
        state.runningAppIds = state.runningAppIds.filter((id) => id !== appId);
        break;
      }
    }
  }, []);

  const getAllNpcs = useCallback((): NpcRuntimeState[] => {
    return Array.from(npcStateMap.current.values());
  }, []);

  const value: WorldContextType = {
    spawnNpcs,
    resolveNpcTarget,
    getNpcApi,
    canNpcLaunchApp,
    registerNpcProcess,
    unregisterNpcProcess,
    getAllNpcs,
  };

  return (
    <WorldContext.Provider value={value}>{children}</WorldContext.Provider>
  );
}
