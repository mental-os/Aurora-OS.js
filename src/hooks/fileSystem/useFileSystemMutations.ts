import { useCallback } from "react";
import { FileNode, User, Group } from "@/utils/fileSystemUtils";
import { notify } from "@/services/notifications";
import {
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

interface UseFileSystemMutationsProps {
  getFileSystem: () => FileNode;
  setFileSystem: React.Dispatch<React.SetStateAction<FileNode>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  currentUser: string | null;
  getCurrentUser: (username: string | null) => User;
  resolvePath: (path: string) => string;
  getNodeAtPath: (path: string, asUser?: string) => FileNode | null;
}

export function useFileSystemMutations({
  setFileSystem,
  users,
  setUsers,
  groups,
  setGroups,
  currentUser,
  getCurrentUser,
  resolvePath,
  getFileSystem,
}: UseFileSystemMutationsProps) {
  const userObj = getCurrentUser(currentUser);

  const getActingUser = useCallback(
    (asUser?: string) =>
      asUser ? users.find((u) => u.username === asUser) || userObj : userObj,
    [users, userObj],
  );

  const deleteNode = useCallback(
    (path: string, asUser?: string): boolean => {
      const actingUser = getActingUser(asUser);
      const result = deleteNodeOp(
        getFileSystem(),
        resolvePath(path),
        actingUser,
      );

      if (!result) return false;
      if (result.error) {
        notify.system("error", "Permission Denied", result.error);
        return false;
      }

      setFileSystem(result.newFs);
      return true;
    },
    [resolvePath, setFileSystem, getFileSystem, getActingUser],
  );

  const moveNode = useCallback(
    (fromPath: string, toPath: string, asUser?: string): boolean => {
      const actingUser = getActingUser(asUser);
      const result = moveNodeOp(
        getFileSystem(),
        resolvePath(fromPath),
        resolvePath(toPath),
        actingUser,
      );

      if (!result) return false;
      if (result.error) {
        notify.system("error", "Permission Denied", result.error);
        return false;
      }

      setFileSystem(result.newFs);
      return true;
    },
    [resolvePath, setFileSystem, getFileSystem, getActingUser],
  );

  const moveToTrash = useCallback(
    (path: string, asUser?: string): boolean => {
      const actingUser = getActingUser(asUser);
      const result = moveToTrashOp(
        getFileSystem(),
        resolvePath(path),
        actingUser,
      );

      if (!result) return false;
      if (result.error) {
        notify.system("error", "Permission Denied", result.error);
        return false;
      }

      setFileSystem(result.newFs);
      return true;
    },
    [resolvePath, setFileSystem, getFileSystem, getActingUser],
  );

  const moveNodeById = useCallback(
    (
      id: string,
      destParentPath: string,
      asUser?: string,
      sourceUserContext?: string,
    ): boolean => {
      const actingUser = getActingUser(asUser);
      const sourceActingUser = sourceUserContext
        ? users.find((u) => u.username === sourceUserContext) || actingUser
        : actingUser;

      const result = moveNodeByIdOp(
        getFileSystem(),
        id,
        resolvePath(destParentPath),
        actingUser,
        sourceActingUser,
      );

      if (!result) return false;
      if (result.error) {
        notify.system("error", "Permission Denied", result.error);
        return false;
      }

      setFileSystem(result.newFs);
      return true;
    },
    [getFileSystem, resolvePath, setFileSystem, getActingUser, users],
  );

  const copyNodeById = useCallback(
    (
      id: string,
      destParentPath: string,
      asUser?: string,
      sourceUserContext?: string,
    ): boolean => {
      const actingUser = getActingUser(asUser);
      const sourceActingUser = sourceUserContext
        ? users.find((u) => u.username === sourceUserContext) || actingUser
        : actingUser;

      const result = copyNodeByIdOp(
        getFileSystem(),
        id,
        resolvePath(destParentPath),
        actingUser,
        sourceActingUser,
      );

      if (!result) return false;
      if (result.error) {
        notify.system("error", "Permission Denied", result.error);
        return false;
      }

      setFileSystem(result.newFs);
      return true;
    },
    [getFileSystem, resolvePath, setFileSystem, getActingUser, users],
  );

  const emptyTrash = useCallback(() => {
    const trashPath = resolvePath("~/.Trash");
    const { newFs } = emptyTrashOp(getFileSystem(), trashPath);
    setFileSystem(newFs);
  }, [resolvePath, getFileSystem, setFileSystem]);

  const createFile = useCallback(
    (
      path: string,
      name: string,
      content: string = "",
      asUser?: string,
      permissions: string = "-rw-r--r--",
    ): boolean => {
      const actingUser = getActingUser(asUser);
      const result = createFileOp(
        getFileSystem(),
        resolvePath(path),
        name,
        content,
        actingUser,
        permissions,
      );

      if (!result) return false;
      setFileSystem(result.newFs);
      return true;
    },
    [resolvePath, setFileSystem, getFileSystem, getActingUser],
  );

  const createDirectory = useCallback(
    (path: string, name: string, asUser?: string): boolean => {
      const actingUser = getActingUser(asUser);
      const result = createDirectoryOp(
        getFileSystem(),
        resolvePath(path),
        name,
        actingUser,
      );

      if (!result) return false;
      setFileSystem(result.newFs);
      return true;
    },
    [resolvePath, setFileSystem, getFileSystem, getActingUser],
  );

  const writeFile = useCallback(
    (path: string, content: string, asUser?: string): boolean => {
      const actingUser = getActingUser(asUser);
      const result = writeFileOp(
        getFileSystem(),
        resolvePath(path),
        content,
        actingUser,
        users,
        groups,
      );

      if (!result) return false;

      setFileSystem(result.newFs);
      if (result.newUsers) setUsers(result.newUsers);
      if (result.newGroups) setGroups(result.newGroups);

      return true;
    },
    [
      resolvePath,
      users,
      groups,
      setFileSystem,
      setUsers,
      setGroups,
      getFileSystem,
      getActingUser,
    ],
  );

  const chmod = useCallback(
    (path: string, mode: string, asUser?: string): boolean => {
      const actingUser = getActingUser(asUser);
      const result = chmodOp(
        getFileSystem(),
        resolvePath(path),
        mode,
        actingUser,
      );

      if (!result) return false;
      setFileSystem(result.newFs);
      return true;
    },
    [resolvePath, setFileSystem, getFileSystem, getActingUser],
  );

  const chown = useCallback(
    (path: string, owner: string, group?: string, asUser?: string): boolean => {
      const actingUser = getActingUser(asUser);
      const result = chownOp(
        getFileSystem(),
        resolvePath(path),
        owner,
        actingUser,
        group,
      );

      if (!result) return false;
      setFileSystem(result.newFs);
      return true;
    },
    [resolvePath, setFileSystem, getFileSystem, getActingUser],
  );

  return {
    deleteNode,
    moveNode,
    moveNodeById,
    moveToTrash,
    emptyTrash,
    createFile,
    createDirectory,
    writeFile,
    chmod,
    chown,
    copyNodeById,
  };
}
