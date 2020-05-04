import mockFs from "mock-fs";
import { findMonoRepo } from "../find-mono-repo";
import { findPackages } from "../find-packages";

describe("findPackages", () => {
  afterEach(() => {
    mockFs.restore();
  });

  it("should find all packages in the mono repo without duplicates", async () => {
    const pkgA = { name: "a", version: "1.0.0", scripts: { start: "node" } };
    const pkgB = { name: "b", version: "2.1.0", dependencies: { abc: "16" } };
    const pkgC = { name: "c", version: "1.2.3", description: "hello world" };
    const monoRepoPkg = {
      private: true,
      workspaces: ["packages/**", "packages/*", "some/deeper/alt-packages/*"],
    };

    mockFs({
      "/package.json": JSON.stringify(monoRepoPkg),
      "/packages/a/package.json": JSON.stringify(pkgA),
      "/packages/b/package.json": JSON.stringify(pkgB),
      "/some/deeper/alt-packages/c/package.json": JSON.stringify(pkgC),
    });

    expect(await findPackages(await findMonoRepo())).toEqual([
      {
        dir: "/packages/a",
        json: pkgA,
      },
      {
        dir: "/packages/b",
        json: pkgB,
      },
      {
        dir: "/some/deeper/alt-packages/c",
        json: pkgC,
      },
    ]);
  });
});
