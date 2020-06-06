import path from "path";
import fs from "fs-extra";
import glob from "glob-promise";
import { MonoRepo, MonoRepoPackage, Package } from "./types";

export interface FindPackagesOptions {
  order?: "alphabetical" | "dependency-graph";
  scope?: MonoRepoPackage;
}

// Walks the dependency tree and returns packages in dependency order
const getPackageDependencies = (
  currentPackage: MonoRepoPackage,
  monoRepoPackages: MonoRepoPackage[],
  resolvedPackages: MonoRepoPackage[] = [],
  seenPackages: MonoRepoPackage[] = []
): MonoRepoPackage[] => {
  // Determine all the local packages that the current package depends on,
  // need to walk each of these all the way down the dependency tree
  const localPackages = [
    ...Object.keys(currentPackage.json?.dependencies ?? {}),
    ...Object.keys(currentPackage.json?.devDependencies ?? {}),
  ]
    .filter((name) => monoRepoPackages.some((p) => p.json.name == name))
    .map((name) => monoRepoPackages.find((p) => p.json.name === name)!);

  // Make copies of passed in arguments we need to manipulate
  const seenLocalPackages = [...seenPackages];
  const resolvedLocalPackages = [...resolvedPackages];

  for (let localPackage of localPackages) {
    // Check if the package has already been seen during this branch
    // of the dependency tree, if it has then there is a circular dependency
    const seenPackage = seenLocalPackages.find(
      (d) => d.json.name === localPackage.json.name
    );

    if (seenPackage) {
      throw new Error(
        `Circular dependency between packages '${seenPackage.json.name}' and '${currentPackage.json.name}'`
      );
    }

    // Mark the current package as now seen
    seenLocalPackages.push(currentPackage);

    // Complete walking the tree for this package dependency recursively
    const nestedLocalPackages = getPackageDependencies(
      localPackage,
      monoRepoPackages,
      resolvedLocalPackages,
      seenLocalPackages
    );

    // Add each nested package found to the resolved list
    for (let nestedLocalPackage of nestedLocalPackages) {
      // If it already exists in the resolved list then need to remove the first
      // entry and add it again so its in a more correct location
      const existingIndex = resolvedLocalPackages.indexOf(nestedLocalPackage);
      if (existingIndex !== -1) {
        resolvedLocalPackages.slice(existingIndex);
      }

      resolvedLocalPackages.push(nestedLocalPackage);
    }
  }

  // If the current package already exists in the resolved list then need to
  // remove the first entry and add it again so its in a more correct location
  const existingIndex = resolvedLocalPackages.indexOf(currentPackage);
  if (existingIndex !== -1) {
    resolvedLocalPackages.slice(existingIndex);
  }

  // Add the current package to the resolved list
  resolvedLocalPackages.push(currentPackage);

  // Return list of packages removing duplicates
  return resolvedLocalPackages.reduce<MonoRepoPackage[]>((acc, next) => {
    return acc.includes(next) ? [...acc] : [...acc, next];
  }, []);
};

export const findPackages = async (
  monoRepo: MonoRepo,
  options: FindPackagesOptions = { order: "alphabetical" }
): Promise<MonoRepoPackage[]> => {
  // Build globs to packages package.json files
  const packageJsonGlobs = monoRepo.packageGlobs.map((x) =>
    path.resolve(monoRepo.dir, x, "package.json")
  );

  // Find all paths to package.jsons via globs
  const globResults = await Promise.all(packageJsonGlobs.map((g) => glob(g)));

  // Need to flatten glob results into a simple array of filepaths and remove duplicates
  const packageJsonFilepaths = globResults
    .reduce(
      (acc, next) => [...acc, ...next.filter((x) => !acc.includes(x))],
      []
    )
    .filter((x) => !x.includes("node_modules"));

  // Load all file contents into a JS object, it's JSON so serializes properly
  const packageJsons = await Promise.all(
    packageJsonFilepaths.map((x: string): Promise<Package> => fs.readJson(x))
  );

  // Apply package meta data on the way out
  const packages = packageJsons.map(
    (x, i): MonoRepoPackage => ({
      dir: packageJsonFilepaths[i].replace("/package.json", ""),
      json: x,
    })
  );

  // Need to construct a root package that depends on
  // all packages to act as the root of the tree if one
  // is not provided so we return all packages
  const rootPackage = {
    dir: "",
    json: {
      name: "",
      version: "1.0.0",
      dependencies: packages.reduce(
        (acc, next) => ({ ...acc, [next.json.name]: next.json.version }),
        {}
      ),
    },
  };

  // Obtain all packages in dependency-graph order by default
  // as it will walk the tree for scoped packages
  const packagesInDependencyGraphOrder = getPackageDependencies(
    options.scope ?? rootPackage,
    packages
  ).filter((p) => p !== rootPackage && p !== options.scope);

  // Return packages sorted appropriately
  switch (options.order) {
    case "dependency-graph": {
      return packagesInDependencyGraphOrder;
    }
    case "alphabetical":
    default: {
      return packagesInDependencyGraphOrder.sort((a, b) =>
        a.json.name.toLowerCase().localeCompare(b.json.name.toLowerCase())
      );
    }
  }
};
