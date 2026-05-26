/**
 * NPC Computer Registry
 *
 * Static configuration for all NPC computers in the game world.
 * These templates are used to provision NPC filesystems when a new game starts.
 * Edit freely before generation — changes here affect all new games.
 *
 * Key architecture notes:
 * - `originalIP`: Immutable key for memory storage (`os_npc_<originalIP>`).
 *   Even if a player changes the NPC's network, this key never changes.
 * - `loreFiles`: Written to absolute VFS paths during provisioning.
 *   Can target anywhere on the filesystem: `/root/`, `/boot/`, `/home/<user>/`, etc.
 * - `installedApps`: App IDs seeded as `#!app <id>` binaries in `/usr/bin/`,
 *   identical to how the local App Store installs apps.
 */

export interface NPCCustomNode {
  /** Name of the file or directory */
  name: string;
  /** 'file' or 'directory' */
  type: "file" | "directory";
  /** Content for files. Optional for directories. */
  content?: string;
  /** Optional size in bytes for files. */
  size?: number;
  /** Children for directories. */
  children?: NPCCustomNode[];
  /** Optional owner (username). Falls back to path-based logic if omitted. */
  owner?: string;
  /** Optional Unix permissions (e.g. '-rw-r--r--' or 'drwxr-xr-x'). Falls back to path-based logic if omitted. */
  permissions?: string;
}

export interface NPCLoreFile extends Partial<NPCCustomNode> {
  /** Absolute VFS path anchor. e.g. '/root/hashes.txt', '/home/mimi/Documents' */
  path: string;
}

export interface NPCTemplate {
  /** Unique ID for referencing this NPC in code */
  id: string;
  /**
   * Immutable original IP — used as the memory storage key.
   * Never changes even if the player changes the NPC's network IP.
   */
  originalIP: string;
  /** Hostname shown in terminal prompt: `mainUser@hostname$` */
  hostname: string;
  /** Hardware RAM limit in GB (same RAM gate logic as player computer) */
  memoryGB: number;
  /** Username of the main account. Connected sessions authenticate as this user. */
  mainUser: string;
  /** Optional default password. If omitted, no password required. */
  mainUserPassword?: string;
  /**
   * App IDs to seed into `/usr/bin/` as `#!app <id>` binaries.
   * Same mechanism as the local App Store install.
   * If an app is not listed here, it is not installed on the NPC.
   */
  installedApps: string[];
  /**
   * Custom filesystem nodes written during provisioning.
   * Support hierarchical definitions with custom owners and permissions.
   * Paths are absolute VFS anchors — the node defined is placed at this path.
   */
  loreFiles: NPCLoreFile[];
}

/**
 * The NPC registry.
 * Add entries here to add new NPC computers to the game world.
 * These are provisioned once at the end of Onboarding (New Game).
 */
export const NPC_REGISTRY: NPCTemplate[] = [
  // Example NPC — uncomment and customize to add your first NPC:
  // {
  //   id: "npc-workstation-01",
  //   originalIP: "192.168.1.50",
  //   hostname: "workstation-01",
  //   memoryGB: 2,
  //   mainUser: "alice",
  //   mainUserPassword: "password123",
  //   installedApps: ["notepad"],
  //   loreFiles: [
  //     {
  //       path: "/home/alice/Documents",
  //       type: "directory",
  //       owner: "alice",
  //       permissions: "drwxr-xr-x",
  //       children: [
  //         {
  //           name: "project-notes.txt",
  //           type: "file",
  //           content: "TODO: finish the quarterly report before Friday.\n",
  //         },
  //       ],
  //     },
  //     {
  //       path: "/root/.bash_history",
  //       type: "file",
  //       content: "ssh admin@10.0.0.1\nsudo cat /etc/shadow\n",
  //       owner: "root",
  //       permissions: "-rw-------",
  //     },
  //   ],
  // },
  {
    id: "soupik",
    originalIP: "10.0.4.22",
    hostname: "soupik",
    memoryGB: 1,
    mainUser: "nugget",
    mainUserPassword: "654321",
    installedApps: ["notepad"],
    loreFiles: [
      {
        path: "/root/.secret",
        type: "directory",
        owner: "root",
        permissions: "drwx------",
        children: [
          { name: "youDidIt.txt", type: "file", content: "You did it!\n" },
        ],
      },
    ],
  },
];
