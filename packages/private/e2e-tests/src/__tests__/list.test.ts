import { runCliCommand } from "../run-cli-command";
import { getMonoRepoTextFixtureDirectory } from "../get-mono-repo-test-fixture-directory";

describe("list command", () => {
  let monoRepoDir = "";

  beforeAll(async () => {
    monoRepoDir = await getMonoRepoTextFixtureDirectory(
      "mono-repo-with-scripts"
    );
  });

  it("should list out packages alphabetically", async () => {
    const runner = runCliCommand("yarn run mono-repo list", {
      cwd: monoRepoDir,
    });

    expect(await runner.waitForStatusCode()).toBe(0);

    expect(runner.stdoutLines).toContainInOrder([
      "package-a",
      "package-b",
      "package-c",
    ]);
  });
});
