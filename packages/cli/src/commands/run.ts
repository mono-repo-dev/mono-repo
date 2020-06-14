import chalk from "chalk";
import {
  findMonoRepo,
  findPackages,
  findPackageGroups,
} from "@mono-repo/utils";
import { runCliCommand } from "../run-cli-command";

interface RunCommandOptions {
  args: string[];
  bail: boolean;
  noBail: boolean;
  parallel: boolean;
  script: string;
  stream: boolean;
  sync: boolean;
}

export const run = async (options: RunCommandOptions) => {
  const monoRepo = await findMonoRepo();
  const packages = (
    await findPackages(monoRepo, { order: "dependency-graph" })
  ).filter((pkg) => pkg.json?.scripts?.[options.script]);
  const packageGroups = (await findPackageGroups(monoRepo))
    .map((group) => group.filter((pkg) => pkg.json?.scripts?.[options.script]))
    .filter((group) => group.length > 0);

  const handleError = (errorOrCode: Error | number) => {
    const error =
      typeof errorOrCode === "number"
        ? `Exited with status code ${errorOrCode}`
        : errorOrCode;

    if (options.bail) {
      throw error;
    }
  };

  const args = ["run", options.script, ...(options.args ?? [])];

  if (options.sync) {
    console.log(
      [
        chalk.greenBright("Target packages (sync order):"),
        ...packages.map((pkg) => pkg.json.name),
        "",
      ].join("\n")
    );

    for (let pkg of packages) {
      try {
        await runCliCommand("yarn", args, {
          cwd: pkg.dir,
          logPrefix: `${chalk.yellowBright(pkg.json.name)}: `,
          stream: options.stream,
        });
      } catch (err) {
        handleError(err);
      }
    }
  } else if (options.parallel) {
    console.log(
      [
        chalk.greenBright("Target packages (parallel):"),
        ...packages.map((pkg) => pkg.json.name),
        "",
      ].join("\n")
    );

    const promises = packages.map((pkg) =>
      runCliCommand("yarn", args, {
        cwd: pkg.dir,
        logPrefix: `${chalk.yellowBright(pkg.json.name)}: `,
        stream: options.stream,
      })
    );

    for (let promise of promises) {
      try {
        await promise;
      } catch (err) {
        handleError(err);
      }
    }
  } else {
    console.log(
      [
        ...packageGroups.map((group, i) =>
          [
            chalk.greenBright(`Target packages (parallel batch ${i + 1})`),
            ...group.map((pkg) => pkg.json.name),
            "",
          ].join("\n")
        ),
      ].join("\n")
    );

    for (let group of packageGroups) {
      const promises = group.map((pkg) =>
        runCliCommand("yarn", args, {
          cwd: pkg.dir,
          logPrefix: `${chalk.yellowBright(pkg.json.name)}: `,
          stream: options.stream,
        })
      );

      for (let promise of promises) {
        try {
          await promise;
        } catch (err) {
          handleError(err);
        }
      }
    }
  }
};
