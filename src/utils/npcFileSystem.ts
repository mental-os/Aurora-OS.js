import { FileNode, User, Group } from "@/utils/fileSystemUtils";
import {
  resolvePathFn,
  getNodeAtPathFn,
  listDirectoryFn,
  readFileFn,
  deleteNodeOp,
  moveNodeOp,
  moveToTrashOp,
  moveNodeByIdOp,
  copyNodeByIdOp,
  emptyTrashOp,
  createFileOp,
  createDirectoryOp,
  writeFileOp,
  chmodOp,
  chownOp,
} from "@/utils/fileSystemOps";

/** Shape returned by createNpcFileSystem, compatible with FileSystemContextType */
export interface NpcFileSystemApi {
  // Identity & State
  fileSystem: FileNode;
  isSafeMode: boolean; // Integrity Status
  currentPath: string;
  currentUser: string | null;
  users: User[];
  groups: Group[];
  homePath: string;
  setCurrentPath: (path: string) => void;

  // Queries
  resolvePath: (path: string, asUser?: string) => string;
  getNodeAtPath: (path: string, asUser?: string) => FileNode | null;
  listDirectory: (path: string, asUser?: string) => FileNode[] | null;
  readFile: (path: string, asUser?: string) => string | null;

  // Mutations
  createFile: (
    path: string,
    name: string,
    content?: string,
    asUser?: string,
    permissions?: string,
  ) => boolean;
  createDirectory: (path: string, name: string, asUser?: string) => boolean;
  writeFile: (path: string, content: string, asUser?: string) => boolean;
  deleteNode: (path: string, asUser?: string) => boolean;
  moveNode: (from: string, to: string, asUser?: string) => boolean;
  moveNodeById: (
    id: string,
    destParentPath: string,
    asUser?: string,
    sourceUserContext?: string,
  ) => boolean;
  copyNodeById: (
    id: string,
    destParentPath: string,
    asUser?: string,
    sourceUserContext?: string,
  ) => boolean;
  moveToTrash: (path: string, asUser?: string) => boolean;
  emptyTrash: () => void;
  chmod: (path: string, mode: string, asUser?: string) => boolean;
  chown: (
    path: string,
    owner: string,
    group?: string,
    asUser?: string,
  ) => boolean;

  // User Management Stubs
  addUser: (
    username: string,
    fullName: string,
    password?: string,
    passwordHint?: string,
    asUser?: string,
    populateHome?: boolean,
  ) => boolean;
  updateUser: (
    username: string,
    updates: {
      fullName?: string;
      password?: string;
      passwordHint?: string;
      isAdmin?: boolean;
    },
    asUser?: string,
  ) => boolean;
  deleteUser: (username: string, asUser?: string) => boolean;

  // Group Management Stubs
  addGroup: (groupName: string, members?: string[]) => boolean;
  addUserToGroup: (username: string, groupName: string) => boolean;
  removeUserFromGroup: (username: string, groupName: string) => boolean;
  deleteGroup: (groupName: string) => boolean;

  // App Management Stubs
  installedApps: Set<string>;
  installApp: (appId: string, asUser?: string) => boolean;
  uninstallApp: (appId: string, asUser?: string) => boolean;
  isAppInstalled: (appId: string) => boolean;

  // Clipboard & Context Stubs
  copyNode: (path: string, asUser?: string) => void;
  cutNode: (path: string, asUser?: string) => void;
  pasteNode: (destPath: string, asUser?: string) => void;
  copyNodeToExternalClipboard: (node: FileNode) => void;
  clearClipboard: () => void;
  clipboard: { items: any[]; operation: "copy" | "cut" };

  // Auth & Session Stubs
  verifyPassword: (username: string, passwordToTry: string) => boolean;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  suspendSession: () => void;

  // Control
  saveFileSystem: () => void;
  resetFileSystem: (silent?: boolean) => void;
  as: (user: string) => NpcFileSystemApi;
  getFileSystem: () => FileNode;
}

export interface NpcFsState {
  fileSystem: FileNode;
  users: User[];
  groups: Group[];
}

type OnMutate = (
  newFs: FileNode,
  newUsers?: User[],
  newGroups?: Group[],
) => void;
type OnHostnameChange = (newHostname: string) => void;

/**
 * Creates a fully functional NPC filesystem API.
 */
export function createNpcFileSystem(
  state: NpcFsState,
  currentUser: string,
  onMutate: OnMutate,
  onHostnameChange?: OnHostnameChange,
): NpcFileSystemApi {
  const getHomePath = (username: string): string => {
    const u = state.users.find((u) => u.username === username);
    return u?.homeDir ?? (username === "root" ? "/root" : `/home/${username}`);
  };

  const getActingUser = (asUser?: string): User => {
    const name = asUser ?? currentUser;
    return (
      state.users.find((u) => u.username === name) ?? {
        username: name,
        uid: 1000,
        gid: 1000,
        fullName: name,
        homeDir: `/home/${name}`,
        shell: "/bin/sh",
      }
    );
  };

  const commit = (
    newFs: FileNode,
    newUsers?: User[],
    newGroups?: Group[],
  ): void => {
    state.fileSystem = newFs;
    if (newUsers) state.users = newUsers;
    if (newGroups) state.groups = newGroups;
    onMutate(newFs, newUsers, newGroups);
  };

  const resolvePath = (path: string, asUser?: string) =>
    resolvePathFn(
      path,
      "/",
      getHomePath(asUser ?? currentUser),
      state.users,
      asUser ?? currentUser,
    );

  const getNodeAtPath = (path: string, asUser?: string) =>
    getNodeAtPathFn(
      state.fileSystem,
      resolvePath(path, asUser),
      getActingUser(asUser),
    );

  const listDirectory = (path: string, asUser?: string) =>
    listDirectoryFn(
      state.fileSystem,
      resolvePath(path, asUser),
      getActingUser(asUser),
    );

  const readFile = (path: string, asUser?: string) =>
    readFileFn(
      state.fileSystem,
      resolvePath(path, asUser),
      getActingUser(asUser),
    );

  const deleteNode = (path: string, asUser?: string) => {
    const res = deleteNodeOp(
      state.fileSystem,
      resolvePath(path, asUser),
      getActingUser(asUser),
    );
    if (!res) return false;
    commit(res.newFs);
    return true;
  };

  const moveNode = (fromPath: string, toPath: string, asUser?: string) => {
    const res = moveNodeOp(
      state.fileSystem,
      resolvePath(fromPath, asUser),
      resolvePath(toPath, asUser),
      getActingUser(asUser),
    );
    if (!res) return false;
    commit(res.newFs);
    return true;
  };

  const moveToTrash = (path: string, asUser?: string) => {
    const res = moveToTrashOp(
      state.fileSystem,
      resolvePath(path, asUser),
      getActingUser(asUser),
    );
    if (!res) return false;
    commit(res.newFs);
    return true;
  };

  const moveNodeById = (
    id: string,
    destParentPath: string,
    asUser?: string,
    sourceUserContext?: string,
  ) => {
    const actingUser = getActingUser(asUser);
    const sourceActingUser = sourceUserContext
      ? getActingUser(sourceUserContext)
      : actingUser;
    const res = moveNodeByIdOp(
      state.fileSystem,
      id,
      resolvePath(destParentPath, asUser),
      actingUser,
      sourceActingUser,
    );
    if (!res) return false;
    commit(res.newFs);
    return true;
  };

  const copyNodeById = (
    id: string,
    destParentPath: string,
    asUser?: string,
    sourceUserContext?: string,
  ) => {
    const actingUser = getActingUser(asUser);
    const sourceActingUser = sourceUserContext
      ? getActingUser(sourceUserContext)
      : actingUser;
    const res = copyNodeByIdOp(
      state.fileSystem,
      id,
      resolvePath(destParentPath, asUser),
      actingUser,
      sourceActingUser,
    );
    if (!res) return false;
    commit(res.newFs);
    return true;
  };

  const emptyTrash = () => {
    const { newFs } = emptyTrashOp(state.fileSystem, resolvePath("~/.Trash"));
    commit(newFs);
  };

  const createFile = (
    path: string,
    name: string,
    content = "",
    asUser?: string,
    permissions = "-rw-r--r--",
  ) => {
    const res = createFileOp(
      state.fileSystem,
      resolvePath(path, asUser),
      name,
      content,
      getActingUser(asUser),
      permissions,
    );
    if (!res) return false;
    commit(res.newFs);
    return true;
  };

  const createDirectory = (path: string, name: string, asUser?: string) => {
    const res = createDirectoryOp(
      state.fileSystem,
      resolvePath(path, asUser),
      name,
      getActingUser(asUser),
    );
    if (!res) return false;
    commit(res.newFs);
    return true;
  };

  const writeFile = (path: string, content: string, asUser?: string) => {
    const resPath = resolvePath(path, asUser);
    const res = writeFileOp(
      state.fileSystem,
      resPath,
      content,
      getActingUser(asUser),
      state.users,
      state.groups,
    );
    if (!res) return false;
    if (resPath === "/etc/hostname" && onHostnameChange) {
      onHostnameChange(content.trim());
    }
    commit(res.newFs, res.newUsers, res.newGroups);
    return true;
  };

  const chmod = (path: string, mode: string, asUser?: string) => {
    const res = chmodOp(
      state.fileSystem,
      resolvePath(path, asUser),
      mode,
      getActingUser(asUser),
    );
    if (!res) return false;
    commit(res.newFs);
    return true;
  };

  const chown = (
    path: string,
    owner: string,
    group?: string,
    asUser?: string,
  ) => {
    const res = chownOp(
      state.fileSystem,
      resolvePath(path, asUser),
      owner,
      getActingUser(asUser),
      group,
    );
    if (!res) return false;
    commit(res.newFs);
    return true;
  };

  return {
    get fileSystem() {
      return state.fileSystem;
    },
    isSafeMode: true,
    currentPath: "/",
    currentUser,
    get users() {
      return state.users;
    },
    get groups() {
      return state.groups;
    },
    homePath: getHomePath(currentUser),
    setCurrentPath: () => {},
    resolvePath,
    getNodeAtPath,
    listDirectory,
    readFile,
    createFile,
    createDirectory,
    writeFile,
    deleteNode,
    moveNode,
    moveNodeById,
    copyNodeById,
    moveToTrash,
    emptyTrash,
    chmod,
    chown,

    // User & Group Management Stubs
    addUser: () => false,
    updateUser: () => false,
    deleteUser: () => false,
    addGroup: () => false,
    addUserToGroup: () => false,
    removeUserFromGroup: () => false,
    deleteGroup: () => false,

    // App Management Stubs
    get installedApps() {
      const binFiles = listDirectory("/usr/bin", "root");
      const apps = new Set<string>();
      if (binFiles) {
        binFiles.forEach((f) => {
          if (f.type === "file" && f.content?.startsWith("#!app ")) {
            apps.add(f.content.replace("#!app ", "").trim());
          }
        });
      }
      return apps;
    },
    installApp: () => false,
    uninstallApp: () => false,
    isAppInstalled: (appId: string) => {
      const binFiles = listDirectory("/usr/bin", "root");
      if (!binFiles) return false;
      return binFiles.some(
        (f) => f.type === "file" && f.content?.startsWith(`#!app ${appId}`),
      );
    },

    // Clipboard & Context Stubs
    copyNode: () => {},
    cutNode: () => {},
    pasteNode: () => {},
    copyNodeToExternalClipboard: () => {},
    clearClipboard: () => {},
    clipboard: { items: [], operation: "copy" },

    // Auth & Session Stubs
    verifyPassword: () => true,
    login: () => false,
    logout: () => {},
    suspendSession: () => {},

    // Control
    saveFileSystem: () => {},
    resetFileSystem: () => {},
    as: (user: string) =>
      createNpcFileSystem(state, user, onMutate, onHostnameChange),
    getFileSystem: () => state.fileSystem,
  };
}
