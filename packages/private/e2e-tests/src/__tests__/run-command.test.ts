import { runCliCommand } from "../run-cli-command";
import { getMonoRepoTextFixtureDirectory } from "../get-mono-repo-test-fixture-directory";

describe("run command", () => {
  let monoRepoDir = "";

  beforeAll(async () => {
    monoRepoDir = await getMonoRepoTextFixtureDirectory(
      "mono-repo-with-scripts"
    );
  });

  it("should run script in all packages in dependency order", async () => {
    const runner = runCliCommand("yarn run mono-repo run echo", {
      cwd: monoRepoDir,
    });

    expect(await runner.waitForStatusCode()).toBe(0);

    expect(runner.stdoutLines).toContainInOrder([
      "Target packages (parallel batch 1):",
      "package-a",
      "package-c",
      "Target packages (parallel batch 2):",
      "package-b",
      "package-a: test-package-a",
      "package-c: test-package-c",
      "package-b: test-package-b",
    ]);
  });

  it("should run script in all packages in sync dependency order", async () => {
    const runner = runCliCommand("yarn run mono-repo run echo --sync", {
      cwd: monoRepoDir,
    });

    expect(await runner.waitForStatusCode()).toBe(0);

    expect(runner.stdoutLines).toContainInOrder([
      "Target packages (sync batch):",
      "package-a",
      "package-c",
      "package-b",
      "package-a: test-package-a",
      "package-c: test-package-c",
      "package-b: test-package-b",
    ]);
  });

  it("should run script in all packages in parallel order", async () => {
    const runner = runCliCommand("yarn run mono-repo run echo --parallel", {
      cwd: monoRepoDir,
    });

    expect(await runner.waitForStatusCode()).toBe(0);

    expect(runner.stdoutLines).toContainInOrder([
      "Target packages (parallel batch):",
      "package-a",
      "package-b",
      "package-c",
      "package-a: test-package-a",
      "package-b: test-package-b",
      "package-c: test-package-c",
    ]);
  });

  it("should stream logs", async () => {
    const runner = runCliCommand(
      "yarn run mono-repo run echo-stream --parallel --stream",
      {
        cwd: monoRepoDir,
      }
    );

    expect(await runner.waitForStatusCode()).toBe(0);

    expect(runner.stdoutLines).toContainInOrder([
      "Target packages (parallel batch):",
      "package-a",
      "package-b",
      "package-c",
      "package-a: test-package-a",
      "package-b: test-package-b",
      "package-c: test-package-c",
      "package-a: test-package-a",
      "package-b: test-package-b",
      "package-c: test-package-c",
    ]);
  });

  it("should have exit code 1 if a script fails", async () => {
    const runner = runCliCommand("yarn run mono-repo run fail", {
      cwd: monoRepoDir,
    });

    expect(await runner.waitForStatusCode()).toBe(1);
  });

  it("should have exit code 0 if a script fails when not bailing", async () => {
    const runner = runCliCommand("yarn run mono-repo run fail --no-bail", {
      cwd: monoRepoDir,
    });

    expect(await runner.waitForStatusCode()).toBe(0);
  });

  it("should forward args", async () => {
    const runner = runCliCommand(
      "yarn run mono-repo run echo-args --sync --args hello",
      {
        cwd: monoRepoDir,
      }
    );

    expect(await runner.waitForStatusCode()).toBe(0);

    expect(runner.stdoutLines).toContainInOrder([
      "Target packages (sync batch):",
      "package-a",
      "package-c",
      "package-b",
      "package-a: hello",
      "package-c: hello",
      "package-b: hello",
    ]);
  });
});
