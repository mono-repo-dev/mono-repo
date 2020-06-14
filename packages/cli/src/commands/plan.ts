import chalk from "chalk";
import {
  findMonoRepo,
  findPackages,
  findPackageGroups,
} from "@mono-repo/utils";

interface PlanCommandOptions {
  parallel: boolean;
}

export const plan = async (options: PlanCommandOptions) => {
  const monoRepo = await findMonoRepo();

  if (options.parallel) {
    const packageGroups = await findPackageGroups(monoRepo, {
      groupBy: "parallelizable",
    });

    console.log(
      packageGroups
        .map((g, i) =>
          [
            chalk.greenBright(
              `${i === 0 ? "First" : "Following"} batch executed in parallel:`
            ),
            ...g.map((p) => p.json.name),
          ].join("\n")
        )
        .join("\n\n")
    );
  } else {
    const packages = await findPackages(monoRepo, {
      order: "dependency-graph",
    });

    console.log(
      [
        chalk.greenBright("Executed in sync:"),
        ...packages.map((p) => p.json.name),
      ].join("\n")
    );
  }
};
