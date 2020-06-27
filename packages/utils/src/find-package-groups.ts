import type { MonoRepo, MonoRepoPackage } from "./types";
import { findPackages } from "./find-packages";

export interface FindGroupedPackagesOptions {
  groupBy: "parallelizable";
}

const getDependencies = (pkg: MonoRepoPackage): string[] => {
  const dependencies = [
    ...Object.keys(pkg.json.dependencies ?? {}),
    ...Object.keys(pkg.json.devDependencies ?? {}),
  ];

  return dependencies;
};

export const findPackageGroups = async (
  monoRepo: MonoRepo,
  options: FindGroupedPackagesOptions = {
    groupBy: "parallelizable",
  }
): Promise<MonoRepoPackage[][]> => {
  switch (options.groupBy) {
    case "parallelizable": {
      const packages = await findPackages(monoRepo, {
        order: "dependency-graph",
      });
      const groups: MonoRepoPackage[][] = [[]];

      for (let currentPackage of packages) {
        let previousGroup = null;
        let pushed = false;
        for (let currentGroup of groups.slice().reverse()) {
          if (
            currentGroup.find((p) =>
              getDependencies(currentPackage).includes(p.json.name)
            )
          ) {
            if (previousGroup) {
              previousGroup.push(currentPackage);
            } else {
              groups.push([currentPackage]);
            }

            pushed = true;
            break;
          }

          previousGroup = currentGroup;
        }

        if (!pushed) {
          groups[0].push(currentPackage);
        }
      }

      return groups;
    }
    default: {
      throw new Error(`Unknown groupBy option '${options.groupBy}'`);
    }
  }
};
