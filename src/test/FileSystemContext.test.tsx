import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  FileSystemProvider,
  useFileSystem,
} from "@/components/FileSystemContext";
import { memory } from "@/utils/memory";

describe("FileSystemContext", () => {
  beforeEach(() => {
    memory.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FileSystemProvider>{children}</FileSystemProvider>
  );

  const setupAuthenticatedUser = async (result: any) => {
    // 1. Login as root
    await act(async () => {
      result.current.login("root", "admin");
    });

    // 2. Create user (simulating Onboarding)
    await act(async () => {
      result.current.addUser("user", "User", "1234");
    });

    // 3. Create home structure
    await act(async () => {
      result.current.createDirectory("/home/user", "Desktop");
      result.current.createDirectory("/home/user", "Documents");
      result.current.createDirectory("/home/user", "Downloads");
      // Ensure .Trash exists for trash tests
      result.current.createDirectory("/home/user", ".Trash");
    });

    // 4. Login as user
    await act(async () => {
      result.current.login("user", "1234");
    });
  };

  it("resolves home path ~", async () => {
    const { result } = renderHook(() => useFileSystem(), { wrapper });

    // Wait for users to populate
    await waitFor(() => {
      expect(result.current.users.length).toBeGreaterThan(0);
    });

    // Setup User Home manually (simulating Onboarding)
    // 1. Login as root
    await act(async () => {
      result.current.login("root", "admin");
    });

    // 2. Create user (simulating Onboarding)
    await act(async () => {
      result.current.addUser("user", "User", "1234");
    });

    // 3. Create home structure (now currentUser is root)
    await act(async () => {
      // Note: addUser creates /home/user automatically if implemented correctly?
      // Let's check: addUser in useAuth -> calls createUserHome.
      // So we might duplicate if we do it manually?
      // createUserHome uses `ensureIds`.
      // Let's rely on addUser to create home, but we verify it.
      // But we need Desktop etc.
      result.current.createDirectory("/home/user", "Desktop");
    });

    // 4. Login as user
    await act(async () => {
      result.current.login("user", "1234");
    });

    expect(result.current.resolvePath("~")).toBe("/home/user");
    expect(result.current.resolvePath("~/Desktop")).toBe("/home/user/Desktop");
  });

  it("resolves absolute path aliases (/Desktop -> ~/Desktop)", async () => {
    const { result } = renderHook(() => useFileSystem(), { wrapper });

    await waitFor(() => {
      expect(result.current.users.length).toBeGreaterThan(0);
    });

    // Setup User Home manually - Sequential steps
    await act(async () => {
      result.current.login("root", "admin");
    });

    await act(async () => {
      result.current.addUser("user", "User", "1234");
    });

    await act(async () => {
      // addUser creates /home/user.
      result.current.createDirectory("/home/user", "Desktop");
      result.current.createDirectory("/home/user", "Documents");
      result.current.createDirectory("/home/user", "Downloads");
    });

    await act(async () => {
      result.current.login("user", "1234");
    });

    // Test the newly added aliases
    expect(result.current.resolvePath("/Desktop")).toBe("/home/user/Desktop");
    expect(result.current.resolvePath("/Documents")).toBe(
      "/home/user/Documents"
    );
    expect(result.current.resolvePath("/Downloads")).toBe(
      "/home/user/Downloads"
    );

    // Subdirectories
    expect(result.current.resolvePath("/Desktop/test.txt")).toBe(
      "/home/user/Desktop/test.txt"
    );
  });

  it("preserves system paths", () => {
    const { result } = renderHook(() => useFileSystem(), { wrapper });
    expect(result.current.resolvePath("/bin")).toBe("/bin");
    expect(result.current.resolvePath("/usr/bin")).toBe("/usr/bin");
    expect(result.current.resolvePath("/etc")).toBe("/etc");
  });

  it("handles relative paths", async () => {
    const { result } = renderHook(() => useFileSystem(), { wrapper });
    await setupAuthenticatedUser(result);

    // Default cwd is ~ (/home/user)
    expect(result.current.resolvePath("test.txt")).toBe("/home/user/test.txt");

    // Change cwd
    await act(async () => {
      result.current.setCurrentPath("/bin");
    });
    expect(result.current.resolvePath("ls")).toBe("/bin/ls");
  });

  it("enforces unique filenames", async () => {
    const { result } = renderHook(() => useFileSystem(), { wrapper });
    await setupAuthenticatedUser(result);

    const path = "/home/user/Desktop";

    // Create first file
    let success = false;
    await act(async () => {
      success = result.current.createFile(path, "test.txt");
    });
    expect(success).toBe(true);

    // Try creating duplicate
    await act(async () => {
      success = result.current.createFile(path, "test.txt");
    });
    expect(success).toBe(false);
  });

  describe("Trash Logic", () => {
    it("moves file to trash", async () => {
      const { result } = renderHook(() => useFileSystem(), { wrapper });
      await setupAuthenticatedUser(result);
      const desktop = "/home/user/Desktop";

      // Create file
      await act(async () => {
        result.current.createFile(desktop, "junk.txt");
      });

      // Move to trash
      let success = false;
      await act(async () => {
        success = result.current.moveToTrash(`${desktop}/junk.txt`);
      });

      expect(success).toBe(true);
      expect(result.current.getNodeAtPath(`${desktop}/junk.txt`)).toBeNull();
      expect(
        result.current.getNodeAtPath("/home/user/.Trash/junk.txt")
      ).not.toBeNull();
    });

    it("handles trash collisions by renaming", async () => {
      const { result } = renderHook(() => useFileSystem(), { wrapper });
      await setupAuthenticatedUser(result);
      const desktop = "/home/user/Desktop";

      // Create two files
      let create1 = false;
      let create2 = false;
      await act(async () => {
        create1 = result.current.createFile(desktop, "file.txt");
      });
      await act(async () => {
        create2 = result.current.createFile(desktop, "file_1.txt"); // placeholder to ensure distinct creation
      });

      // Move first one
      let s1 = false;
      await act(async () => {
        s1 = result.current.moveToTrash(`${desktop}/file.txt`);
      });

      // Re-create file.txt at source
      let s2 = false;
      await act(async () => {
        s2 = result.current.createFile(desktop, "file.txt");
      });

      // Move second one
      let s3 = false;
      await act(async () => {
        s3 = result.current.moveToTrash(`${desktop}/file.txt`);
      });

      expect(create1).toBe(true);
      expect(create2).toBe(true);
      expect(s1).toBe(true);
      expect(s2).toBe(true);
      expect(s3).toBe(true);

      expect(
        result.current.getNodeAtPath("/home/user/.Trash/file.txt")
      ).not.toBeNull();
      expect(
        result.current.getNodeAtPath("/home/user/.Trash/file 1.txt")
      ).not.toBeNull();
    });

    it("empties trash", async () => {
      const { result } = renderHook(() => useFileSystem(), { wrapper });
      await setupAuthenticatedUser(result);
      const desktop = "/home/user/Desktop";

      await act(async () => {
        result.current.createFile(desktop, "rubbish.txt");
      });

      await act(async () => {
        result.current.moveToTrash(`${desktop}/rubbish.txt`);
      });

      expect(
        result.current.getNodeAtPath("/home/user/.Trash/rubbish.txt")
      ).not.toBeNull();

      await act(async () => {
        result.current.emptyTrash();
      });

      // Trash folder should check for children being empty, but the folder itself might remain or be empty.
      // Based on implementation, .Trash node always exists but children are cleared.
      const trash = result.current.getNodeAtPath("/home/user/.Trash");
      expect(trash?.children?.length).toBe(0);
    });
  });

  describe("Permissions & Ownership", () => {
    it("chmod updates file permissions", () => {
      const { result } = renderHook(() => useFileSystem(), { wrapper });
      // Login as root to ensure we can chmod anything
      act(() => {
        result.current.login("root", "admin");
      });

      const file = "/root/test.txt";
      act(() => {
        result.current.createFile("/root", "test.txt");
      });

      act(() => {
        result.current.chmod(file, "777");
      });

      const node = result.current.getNodeAtPath(file);
      expect(node?.permissions).toBe("-rwxrwxrwx");

      act(() => {
        result.current.chmod(file, "644");
      });
      expect(result.current.getNodeAtPath(file)?.permissions).toBe(
        "-rw-r--r--"
      );
    });

    it("chown updates owner and group", () => {
      const { result } = renderHook(() => useFileSystem(), { wrapper });
      act(() => {
        result.current.login("root", "admin");
      });

      const file = "/root/owned.txt";
      act(() => {
        result.current.createFile("/root", "owned.txt");
      });

      act(() => {
        result.current.chown(file, "user", "users");
      });

      const node = result.current.getNodeAtPath(file);
      expect(node?.owner).toBe("user");
      expect(node?.group).toBe("users");
    });

    it("manages groups", () => {
      const { result } = renderHook(() => useFileSystem(), { wrapper });
      act(() => {
        result.current.login("root", "admin");
      });

      act(() => {
        result.current.addGroup("developers", ["user"]);
      });

      expect(
        result.current.groups.find((g) => g.groupName === "developers")
      ).toBeDefined();

      act(() => {
        result.current.deleteGroup("developers");
      });

      expect(
        result.current.groups.find((g) => g.groupName === "developers")
      ).toBeUndefined();
    });
  });
});
