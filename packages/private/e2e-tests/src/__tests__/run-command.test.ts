import { runCliCommand } from "../run-cli-command";
import { getWorkspaceDirectory } from "../get-workspace-directory";

describe("run command", () => {
  it("should run script in all packages in dependency order", async () => {
    const workspaceDir = await getWorkspaceDirectory("mono-repo-a");
    const runner = runCliCommand("yarn run mono-repo run echo", {
      cwd: workspaceDir,
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
    const workspaceDir = await getWorkspaceDirectory("mono-repo-a");
    const runner = runCliCommand("yarn run mono-repo run echo --sync", {
      cwd: workspaceDir,
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
    const workspaceDir = await getWorkspaceDirectory("mono-repo-a");
    const runner = runCliCommand("yarn run mono-repo run echo --parallel", {
      cwd: workspaceDir,
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
    const workspaceDir = await getWorkspaceDirectory("mono-repo-a");
    const runner = runCliCommand(
      "yarn run mono-repo run echo-stream --parallel --stream",
      {
        cwd: workspaceDir,
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
    const workspaceDir = await getWorkspaceDirectory("mono-repo-a");
    const runner = runCliCommand("yarn run mono-repo run fail", {
      cwd: workspaceDir,
    });

    expect(await runner.waitForStatusCode()).toBe(1);
  });

  it("should have exit code 0 if a script fails when not bailing", async () => {
    const workspaceDir = await getWorkspaceDirectory("mono-repo-a");
    const runner = runCliCommand("yarn run mono-repo run fail --no-bail", {
      cwd: workspaceDir,
    });

    expect(await runner.waitForStatusCode()).toBe(0);
  });

  it("should forward args", async () => {
    const workspaceDir = await getWorkspaceDirectory("mono-repo-a");
    const runner = runCliCommand(
      "yarn run mono-repo run echo-args --sync --args hello",
      {
        cwd: workspaceDir,
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
