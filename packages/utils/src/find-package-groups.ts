import type { MonoRepo, MonoRepoPackage } from "./types";
import { findPackages } from "./find-packages";

export interface FindGroupedPackagesOptions {
  groupBy: "parallelize";
}

export const findPackageGroups = async (
  monoRepo: MonoRepo,
  options: FindGroupedPackagesOptions = {
    groupBy: "parallelize",
  }
): Promise<MonoRepoPackage[][]> => {
  switch (options.groupBy) {
    case "parallelize": {
      const packages = await findPackages(monoRepo, {
        order: "dependency-graph",
      });
      const groups: MonoRepoPackage[][] = [];
      let currentGroup: MonoRepoPackage[] = [];

      for (let pkg of packages) {
        const dependencies = [
          ...Object.keys(pkg.json.dependencies ?? {}),
          ...Object.keys(pkg.json.devDependencies ?? {}),
        ];

        if (currentGroup.find((p) => dependencies.includes(p.json.name))) {
          groups.push(currentGroup);
          currentGroup = [];
        }

        currentGroup.push(pkg);
      }

      groups.push(currentGroup);

      return groups;
    }
    default: {
      throw new Error(`Unknown groupBy option '${options.groupBy}'`);
    }
  }
};
