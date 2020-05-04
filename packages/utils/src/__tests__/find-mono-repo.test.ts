import mockFs from "mock-fs";
import { findMonoRepo } from "../find-mono-repo";

describe("findMonoRepo", () => {
  afterEach(() => {
    mockFs.restore();
  });

  describe("inside a mono repo", () => {
    it("should find the mono repo in same directory (workspaces shorthand config)", async () => {
      mockFs({
        "/package.json": JSON.stringify({
          private: true,
          workspaces: ["packages/**"],
        }),
      });

      expect(await findMonoRepo()).toEqual({
        dir: "/",
        packageGlobs: ["packages/**"],
      });
    });

    it("should find the mono repo in same directory (workspaces longhand config)", async () => {
      mockFs({
        "/package.json": JSON.stringify({
          private: true,
          workspaces: { packages: ["packages/**"] },
        }),
      });

      expect(await findMonoRepo()).toEqual({
        dir: "/",
        packageGlobs: ["packages/**"],
      });
    });

    it("should travel up directories during the search", async () => {
      mockFs({
        "/package.json": JSON.stringify({
          private: true,
          workspaces: ["packages/**"],
        }),
        "/nested/directory/temp.txt": "hello world",
      });

      expect(await findMonoRepo({ cwd: "/nested/directory" })).toEqual({
        dir: "/",
        packageGlobs: ["packages/**"],
      });
    });
  });

  describe("not in a mono repo", () => {
    it("should throw if not inside a mono repo (no package.json)", async () => {
      mockFs({
        "/temp.txt": "hello world",
      });

      await expect(findMonoRepo()).rejects.toThrow(
        "Could not find mono repo root directory."
      );
    });

    it("should throw if not inside a mono repo (invalid package.json - not private)", async () => {
      mockFs({
        "/package.json": JSON.stringify({ private: false, workspaces: [] }),
      });

      await expect(findMonoRepo()).rejects.toThrow(
        "Could not find mono repo root directory."
      );
    });

    it("should throw if not inside a mono repo (invalid package.json - workspaces not array or object)", async () => {
      mockFs({
        "/package.json": JSON.stringify({
          workspaces: "hello",
          private: true,
        }),
      });

      await expect(findMonoRepo()).rejects.toThrow(
        "Could not find mono repo root directory."
      );
    });

    it("should throw if not inside a mono repo (invalid package.json - invalid workspaces no packages)", async () => {
      mockFs({
        "/package.json": JSON.stringify({
          workspaces: { notPackages: [] },
          private: true,
        }),
      });

      await expect(findMonoRepo()).rejects.toThrow(
        "Could not find mono repo root directory."
      );
    });
  });
});
