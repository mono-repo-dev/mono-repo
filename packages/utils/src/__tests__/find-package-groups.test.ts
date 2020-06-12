import mockFs from "mock-fs";
import { findMonoRepo } from "../find-mono-repo";
import { findPackageGroups } from "../find-package-groups";

describe("findPackageGroups", () => {
  afterEach(() => {
    mockFs.restore();
  });

  it("should find all packages in the mono repo without duplicates (grouped by dependendant-parallel-order)", async () => {
    const pkgA = {
      name: "a",
      version: "1.0.0",
      dependencies: { b: "1.0.0", c: "1.0.0" },
    };
    const pkgB = { name: "b", version: "1.0.0" };
    const pkgC = {
      name: "c",
      version: "1.0.0",
      dependencies: { d: "1.0.0" },
      devDependencies: { f: "1.0.0" },
    };
    const pkgD = {
      name: "d",
      version: "1.0.0",
      dependencies: { e: "1.0.0", f: "1.0.0" },
    };
    const pkgE = { name: "e", version: "1.0.0", dependencies: {} };
    const pkgF = { name: "f", version: "1.0.0", dependencies: {} };
    const monoRepoPkg = {
      private: true,
      workspaces: ["packages/**"],
    };

    mockFs({
      "/package.json": JSON.stringify(monoRepoPkg),
      "/packages/a/package.json": JSON.stringify(pkgA),
      "/packages/b/package.json": JSON.stringify(pkgB),
      "/packages/c/package.json": JSON.stringify(pkgC),
      "/packages/d/package.json": JSON.stringify(pkgD),
      "/packages/e/package.json": JSON.stringify(pkgE),
      "/packages/f/package.json": JSON.stringify(pkgF),
    });

    expect(await findPackageGroups(await findMonoRepo())).toEqual([
      [
        {
          dir: "/packages/b",
          json: pkgB,
        },
        {
          dir: "/packages/e",
          json: pkgE,
        },
        {
          dir: "/packages/f",
          json: pkgF,
        },
      ],
      [
        {
          dir: "/packages/d",
          json: pkgD,
        },
      ],
      [
        {
          dir: "/packages/c",
          json: pkgC,
        },
      ],
      [
        {
          dir: "/packages/a",
          json: pkgA,
        },
      ],
    ]);
  });

  it("should throw when there is a circular dependency (a -> b, b -> a)", async () => {
    const pkgA = { name: "a", version: "1.0.0", dependencies: { b: "1.0.0" } };
    const pkgB = { name: "b", version: "1.0.0", dependencies: { a: "1.0.0" } };
    const monoRepoPkg = {
      private: true,
      workspaces: ["packages/**"],
    };

    mockFs({
      "/package.json": JSON.stringify(monoRepoPkg),
      "/packages/a/package.json": JSON.stringify(pkgA),
      "/packages/b/package.json": JSON.stringify(pkgB),
    });

    await expect(
      async () => await findPackageGroups(await findMonoRepo())
    ).rejects.toThrowError("Circular dependency between packages 'a' and 'b'");
  });

  it("should throw when there is a circular dependency (a-> a, a -> a)", async () => {
    const pkgA = { name: "a", version: "1.0.0", dependencies: { a: "1.0.0" } };
    const monoRepoPkg = {
      private: true,
      workspaces: ["packages/**"],
    };

    mockFs({
      "/package.json": JSON.stringify(monoRepoPkg),
      "/packages/a/package.json": JSON.stringify(pkgA),
    });

    await expect(
      async () => await findPackageGroups(await findMonoRepo())
    ).rejects.toThrowError("Circular dependency between packages 'a' and 'a'");
  });

  it("should throw on unknown groupBy option", async () => {
    await expect(
      // @ts-ignore - purposefully incorrect type
      findPackageGroups(await findMonoRepo(), { groupBy: "unknown" })
    ).rejects.toThrowError("Unknown groupBy option 'unknown'");
  });
});
