import { runCliCommand } from "../run-cli-command";
import { getWorkspaceDirectory } from "../get-workspace-directory";

describe("list command", () => {
  it("should list out packages alphabetically", async () => {
    const workspaceDir = await getWorkspaceDirectory("mono-repo-a");
    const runner = runCliCommand("yarn run mono-repo list", {
      cwd: workspaceDir,
    });

    expect(await runner.waitForStatusCode()).toBe(0);

    expect(runner.stdoutLines).toContainInOrder([
      "package-a",
      "package-b",
      "package-c",
    ]);
  });
});
