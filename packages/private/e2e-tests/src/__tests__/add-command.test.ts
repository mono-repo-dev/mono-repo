import { spawnSync } from "child_process";
import path from "path";
import fs from "fs-extra";
import { runCliCommand } from "../run-cli-command";
import { getMonoRepoTextFixtureDirectory } from "../get-mono-repo-test-fixture-directory";

describe("add command", () => {
  let monoRepoDir = "";
  let monoRepoNodeModulesDir = "";
  let higherMonoRepoDir = "";
  let packageDDir = "";
  let packageDJsonFilepath = "";
  let packageDJson = null;
  let packageEDir = "";
  let packageEJsonFilepath = "";
  let packageEJson = null;
  let isOddVersion = "";

  beforeAll(async () => {
    monoRepoDir = await getMonoRepoTextFixtureDirectory(
      "mono-repo-with-no-dependencies"
    );
    monoRepoNodeModulesDir = path.resolve(monoRepoDir, "node_modules");
    higherMonoRepoDir = path.resolve(monoRepoDir, "..");
    packageDDir = path.resolve(monoRepoDir, "packages/package-d");
    packageDJsonFilepath = path.resolve(packageDDir, "package.json");
    packageDJson = await fs.readJSON(packageDJsonFilepath);
    packageEDir = path.resolve(monoRepoDir, "packages/package-e");
    packageEJsonFilepath = path.resolve(packageEDir, "package.json");
    packageEJson = await fs.readJSON(packageEJsonFilepath);
    isOddVersion = spawnSync("npm", ["show", "is-odd", "version"], {
      encoding: "utf8",
    }).stdout.split("\n")[0];
  });

  const resetMonoRepo = async () => {
    await fs.writeJSON(packageDJsonFilepath, packageDJson, {
      encoding: "utf8",
      spaces: 2,
    });
    await fs.remove(monoRepoNodeModulesDir);
    spawnSync("yarn", [], { cwd: higherMonoRepoDir });
  };

  beforeEach(async () => {
    await resetMonoRepo();
  });

  afterEach(async () => {
    await resetMonoRepo();
  });

  it("should inform the user they are not in a package directory", async () => {
    const runner = runCliCommand("yarn run mono-repo add is-odd", {
      cwd: monoRepoDir,
    });
    const statusCode = await runner.waitForStatusCode();
    expect(statusCode).toBe(1);
    expect(runner.stderrLines).toContainInOrder([
      "Error: Not in a package directory.",
    ]);
  });

  it("should add a remote dependency to the package", async () => {
    const runner = runCliCommand("yarn run mono-repo add is-odd", {
      cwd: packageDDir,
    });

    expect(await runner.waitForStatusCode()).toBe(0);

    const packageDJson = await fs.readJson(packageDJsonFilepath, {
      encoding: "utf8",
    });

    expect(packageDJson.dependencies["is-odd"]).toBe(`^${isOddVersion}`);
  });

  it("should add a remote dev dependency to the package", async () => {
    const runner = runCliCommand("yarn run mono-repo add is-odd --dev", {
      cwd: packageDDir,
    });

    expect(await runner.waitForStatusCode()).toBe(0);

    const packageDJson = await fs.readJson(packageDJsonFilepath, {
      encoding: "utf8",
    });

    expect(packageDJson.devDependencies["is-odd"]).toBe(`^${isOddVersion}`);
  });

  it("should add a remote peer dependency to the package", async () => {
    const runner = runCliCommand("yarn run mono-repo add is-odd --peer", {
      cwd: packageDDir,
    });

    expect(await runner.waitForStatusCode()).toBe(0);

    const packageDJson = await fs.readJson(packageDJsonFilepath, {
      encoding: "utf8",
    });

    expect(packageDJson.peerDependencies["is-odd"]).toBe(`^${isOddVersion}`);
  });

  it("should add a local dependency to the package", async () => {
    const runner = runCliCommand("yarn run mono-repo add package-e", {
      cwd: packageDDir,
    });

    expect(await runner.waitForStatusCode()).toBe(0);

    const packageDJson = await fs.readJson(packageDJsonFilepath, {
      encoding: "utf8",
    });

    expect(packageDJson.dependencies["package-e"]).toBe(packageEJson.version);
  });

  it("should add a local dev dependency to the package", async () => {
    const runner = runCliCommand("yarn run mono-repo add package-e --dev", {
      cwd: packageDDir,
    });

    expect(await runner.waitForStatusCode()).toBe(0);

    const packageDJson = await fs.readJson(packageDJsonFilepath, {
      encoding: "utf8",
    });

    expect(packageDJson.devDependencies["package-e"]).toBe(
      packageEJson.version
    );
  });

  it("should add a local peer dependency to the package", async () => {
    const runner = runCliCommand("yarn run mono-repo add package-e --peer", {
      cwd: packageDDir,
    });

    expect(await runner.waitForStatusCode()).toBe(0);

    const packageDJson = await fs.readJson(packageDJsonFilepath, {
      encoding: "utf8",
    });

    expect(packageDJson.peerDependencies["package-e"]).toBe(
      packageEJson.version
    );
  });
});
