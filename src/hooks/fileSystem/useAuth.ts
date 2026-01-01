import { useState, useEffect, useCallback } from "react";
import {
  User,
  Group,
  createUserHome,
  ensureIds,
  deepCloneFileSystem,
  FileNode,
} from "../../utils/fileSystemUtils";
import { verifyUserPassword } from "../../utils/authUtils";
import {
  checkMigrationNeeded,
  migrateUsers,
  migrateGroups,
} from "../../utils/migrations";
import { notify } from "../../services/notifications";

const USERS_STORAGE_KEY = "aurora-users";
const GROUPS_STORAGE_KEY = "aurora-groups";

const DEFAULT_USERS: User[] = [
  {
    username: "root",
    password: "admin",
    uid: 0,
    gid: 0,
    fullName: "System Administrator",
    homeDir: "/root",
    shell: "/bin/bash",
    groups: ["root"],
  },
  {
    username: "user",
    password: "1234",
    uid: 1000,
    gid: 1000,
    fullName: "User",
    homeDir: "/home/user",
    shell: "/bin/bash",
    groups: ["users", "admin"],
  },
  {
    username: "guest",
    password: "guest",
    uid: 1001,
    gid: 1001,
    fullName: "Guest",
    homeDir: "/home/guest",
    shell: "/bin/bash",
    groups: ["users"],
  },
];

const DEFAULT_GROUPS: Group[] = [
  { groupName: "root", gid: 0, members: ["root"], password: "x" },
  { groupName: "users", gid: 100, members: ["user", "guest"], password: "x" },
  { groupName: "admin", gid: 10, members: ["user"], password: "x" },
];

function loadUsers(): User[] {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (checkMigrationNeeded()) {
          return migrateUsers(parsed, DEFAULT_USERS);
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load users:", e);
  }
  return DEFAULT_USERS;
}

function loadGroups(): Group[] {
  try {
    const stored = localStorage.getItem(GROUPS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (checkMigrationNeeded()) {
        return migrateGroups(parsed, DEFAULT_GROUPS);
      }
      return parsed;
    }
  } catch (e) {
    console.warn("Failed to load groups:", e);
  }
  return DEFAULT_GROUPS;
}

export function useAuth(
  fileSystem: FileNode,
  setFileSystem: React.Dispatch<React.SetStateAction<FileNode>>
) {
  const [users, setUsers] = useState<User[]>(() => loadUsers());
  const [groups, setGroups] = useState<Group[]>(() => loadGroups());
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Persist users & groups
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
  }, [groups]);

  const getCurrentUser = useCallback(
    (username: string | null): User => {
      if (!username)
        return {
          username: "nobody",
          uid: 65534,
          gid: 65534,
          fullName: "Nobody",
          homeDir: "/",
          shell: "",
        };
      return (
        users.find((u) => u.username === username) || {
          username: "nobody",
          uid: 65534,
          gid: 65534,
          fullName: "Nobody",
          homeDir: "/",
          shell: "",
        }
      );
    },
    [users]
  );

  const login = useCallback(
    (username: string, password?: string) => {
      const isValid = verifyUserPassword(
        username,
        password || "",
        fileSystem,
        users
      );

      if (isValid) {
        setCurrentUser(username);
        notify.system("success", "Auth", `Logged in as ${username}`);
        return true;
      } else {
        // Check if user even exists to give better error
        const userExists = users.some((u) => u.username === username);
        if (userExists) {
          notify.system("error", "Auth", "Incorrect password");
        } else {
          notify.system("error", "Auth", "User not found");
        }
        return false;
      }
    },
    [fileSystem, users]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    notify.system("success", "Auth", "Logged out");
  }, []);

  const addUser = useCallback(
    (
      username: string,
      fullName: string,
      password?: string,
      passwordHint?: string,
      asUser?: string
    ): boolean => {
      const actingUser = getCurrentUser(asUser || currentUser);
      const isAdmin =
        actingUser.username === "root" ||
        actingUser.groups?.some((g) => ["admin", "root", "wheel"].includes(g));

      if (!isAdmin) {
        notify.system(
          "error",
          "Permission Denied",
          "Only administrators can add users"
        );
        return false;
      }

      if (users.some((u) => u.username === username)) return false;
      const maxUid = Math.max(...users.map((u) => u.uid));
      const newUid = maxUid < 1000 ? 1000 : maxUid + 1;
      const newUser: User = {
        username,
        password: password || "x",
        passwordHint: passwordHint || '',
        uid: newUid,
        gid: newUid,
        fullName,
        homeDir: `/home/${username}`,
        shell: "/bin/bash",
      };
      setUsers((prev) => [...prev, newUser]);

      // Ensure home directory exists
      const homeNode = ensureIds(createUserHome(username));
      setFileSystem((prevFS) => {
        const newFS = deepCloneFileSystem(prevFS);
        let homeDir = newFS.children?.find((c) => c.name === "home");
        if (!homeDir) {
          homeDir = {
            id: crypto.randomUUID(),
            name: "home",
            type: "directory",
            children: [],
            owner: "root",
            permissions: "drwxr-xr-x",
          };
          if (newFS.children) newFS.children.push(homeDir);
          else newFS.children = [homeDir];
        }
        if (homeDir && homeDir.children) {
          if (!homeDir.children.some((c) => c.name === username))
            homeDir.children.push(homeNode);
        }
        return newFS;
      });
      return true;
    },
    [users, setFileSystem, getCurrentUser, currentUser]
  );

  const deleteUser = useCallback(
    (username: string, asUser?: string): boolean => {
      const actingUser = getCurrentUser(asUser || currentUser);
      const isAdmin =
        actingUser.username === "root" ||
        actingUser.groups?.some((g) => ["admin", "root", "wheel"].includes(g));

      if (!isAdmin) {
        notify.system(
          "error",
          "Permission Denied",
          "Only administrators can delete users"
        );
        return false;
      }

      if (username === "root" || username === "user") {
        notify.system(
          "error",
          "User Management",
          "Cannot delete default system users"
        );
        return false;
      }
      const target = users.find((u) => u.username === username);
      if (!target) return false;
      setUsers((prev) => prev.filter((u) => u.username !== username));
      return true;
    },
    [users, getCurrentUser, currentUser]
  );

  const addGroup = useCallback(
    (groupName: string, members: string[] = []): boolean => {
      if (groups.some((g) => g.groupName === groupName)) return false;
      const maxGid = Math.max(...groups.map((g) => g.gid));
      const newGid = maxGid < 100 ? 100 : maxGid + 1;
      const newGroup: Group = {
        groupName,
        gid: newGid,
        members: members,
        password: "x",
      };
      setGroups((prev) => [...prev, newGroup]);
      return true;
    },
    [groups]
  );

  const deleteGroup = useCallback(
    (groupName: string): boolean => {
      if (["root", "users", "admin"].includes(groupName)) {
        notify.system(
          "error",
          "Group Management",
          "Cannot delete system group"
        );
        return false;
      }
      if (!groups.some((g) => g.groupName === groupName)) return false;
      setGroups((prev) => prev.filter((g) => g.groupName !== groupName));
      return true;
    },
    [groups]
  );

  const resetAuthState = useCallback(() => {
    setUsers(DEFAULT_USERS);
    setGroups(DEFAULT_GROUPS);
    setCurrentUser(null);
  }, []);

  // NOTE: The /etc/passwd and /etc/group sync effects will remain in FileSystemContext
  // or be composed there, because they link state -> view (FS).
  // Actually, I should probably expose the sync logic here or make sure the context orchestrates it.

  return {
    users,
    setUsers,
    groups,
    setGroups,
    currentUser,
    setCurrentUser,
    getCurrentUser,
    login,
    logout,
    addUnits: addUser, // Alias or keep as is? Let's fix the typo in return if any
    addUser,
    deleteUser,
    addGroup,
    deleteGroup,
    resetAuthState,
    verifyUserPassword: (u: string, p: string) =>
      verifyUserPassword(u, p, fileSystem, users),
  };
}
