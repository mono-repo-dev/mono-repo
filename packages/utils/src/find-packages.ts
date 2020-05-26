import path from "path";
import fs from "fs-extra";
import glob from "glob-promise";
import { MonoRepo, MonoRepoPackage, Package } from "./types";

export interface FindPackagesOptions {
  order?: "alphabetical" | "dependency";
}

// Walks the dependency tree and returns packages in dependency order
const getFlatPackageDependencies = (
  currentPackage: MonoRepoPackage,
  monoRepoPackages: MonoRepoPackage[],
  resolvedPackages: MonoRepoPackage[] = [],
  seenPackages: MonoRepoPackage[] = []
): MonoRepoPackage[] => {
  // Determine all the local packages that the current package depends on,
  // need to walk each of these all the way down the dependency tree
  const localPackages = Object.keys(currentPackage.json?.dependencies)
    .filter((name) => monoRepoPackages.some((p) => p.json.name == name))
    .map((name) => monoRepoPackages.find((p) => p.json.name === name));

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
    const nestedLocalPackages = getFlatPackageDependencies(
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
  return resolvedLocalPackages.reduce((acc, next) => {
    return acc.includes(next) ? [...acc] : [...acc, next];
  }, []);
};

// Sort packages by their dependency tree
const orderByDependencyTree = async (
  packages: MonoRepoPackage[]
): Promise<MonoRepoPackage[]> => {
  // Need to construct a root package that depends on
  // all packages to act as the root of the tree
  const rootPackage: MonoRepoPackage = {
    dir: "",
    json: {
      name: "",
      version: "1.0.0",
      dependencies: {},
    },
  };
  for (let pkg of packages) {
    rootPackage.json.dependencies[pkg.json.name] = pkg.json.version;
  }

  // Walk the dependency tree and then remove the root package as it doesn't really exist
  return getFlatPackageDependencies(rootPackage, packages).filter(
    (p) => p !== rootPackage
  );
};

// Sort packages alphabetically by name
const orderAlphabetically = async (
  packages: MonoRepoPackage[]
): Promise<MonoRepoPackage[]> => {
  return packages.sort((a, b) =>
    a.json.name.toLowerCase().localeCompare(b.json.name.toLowerCase())
  );
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

  // Return packages sorted appropriately
  switch (options.order) {
    case "dependency": {
      return await orderByDependencyTree(packages);
    }
    case "alphabetical":
    default: {
      return await orderAlphabetically(packages);
    }
  }
};
