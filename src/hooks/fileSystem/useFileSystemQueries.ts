import { useCallback } from "react";
import { FileNode, User } from "@/utils/fileSystemUtils";
import {
  resolvePathFn,
  getNodeAtPathFn,
  listDirectoryFn,
  readFileFn,
} from "@/utils/fileSystemOps";

export function useFileSystemQueries(
  fileSystem: FileNode,
  users: User[],
  currentPath: string,
  homePath: string,
  getCurrentUser: (username: string | null) => User,
  currentUser: string | null,
) {
  const userObj = getCurrentUser(currentUser);

  const resolvePath = useCallback(
    (path: string, asUser?: string): string => {
      return resolvePathFn(path, currentPath, homePath, users, asUser);
    },
    [homePath, currentPath, users],
  );

  const getNodeAtPath = useCallback(
    (path: string, asUser?: string): FileNode | null => {
      const resolved = resolvePath(path, asUser);
      const actingUser = asUser
        ? users.find((u) => u.username === asUser) || userObj
        : userObj;
      return getNodeAtPathFn(fileSystem, resolved, actingUser);
    },
    [fileSystem, resolvePath, userObj, users],
  );

  const listDirectory = useCallback(
    (path: string, asUser?: string): FileNode[] | null => {
      const resolved = resolvePath(path, asUser);
      const actingUser = asUser
        ? users.find((u) => u.username === asUser) || userObj
        : userObj;
      return listDirectoryFn(fileSystem, resolved, actingUser);
    },
    [resolvePath, fileSystem, userObj, users],
  );

  const readFile = useCallback(
    (path: string, asUser?: string): string | null => {
      const resolved = resolvePath(path, asUser);
      const actingUser = asUser
        ? users.find((u) => u.username === asUser) || userObj
        : userObj;
      return readFileFn(fileSystem, resolved, actingUser);
    },
    [resolvePath, fileSystem, userObj, users],
  );

  return {
    resolvePath,
    getNodeAtPath,
    listDirectory,
    readFile,
  };
}
