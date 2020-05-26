import path from "path";
import fs from "fs-extra";
import glob from "glob-promise";
import { MonoRepo, MonoRepoPackage, Package } from "./types";

export interface FindPackagesOptions {
  order?: "alphabetical" | "dependency";
}

const getOrderedDependencyPackages = (
  pkg: MonoRepoPackage,
  packages: MonoRepoPackage[],
  resolvedPackages: MonoRepoPackage[] = [],
  seenPackages: MonoRepoPackage[] = []
): MonoRepoPackage[] => {
  const localDependencyPackages = Object.keys(pkg.json?.dependencies)
    .filter((dep) => packages.some((p) => p.json.name == dep))
    .map((name) => packages.find((p) => p.json.name === name));

  const seenPkgs = [...seenPackages];
  let depPkgs = [...resolvedPackages];
  for (let localDependencyPackage of localDependencyPackages) {
    const seen = seenPkgs.find(
      (d) => d.json.name === localDependencyPackage.json.name
    );
    if (seen) {
      throw new Error(
        `Circular dependency between packages '${seen.json.name}' and '${pkg.json.name}'`
      );
    }
    seenPkgs.push(pkg);
    const newDeps = getOrderedDependencyPackages(
      localDependencyPackage,
      packages,
      depPkgs,
      seenPkgs
    );
    for (let newDep of newDeps) {
      const exists = depPkgs.find((d) => d.json.name === newDep.json.name);
      if (exists) {
        depPkgs = depPkgs.splice(depPkgs.indexOf(exists));
      }
      const seen = seenPkgs.find((d) => d.json.name === newDep.json.name);
      if (seen) {
        throw new Error(
          `Ciruclar dependency between packages '${seen.json.name}' and '${newDep.json.name}'`
        );
      }

      depPkgs.push(newDep);
    }
  }

  const exists = depPkgs.find((d) => d.json.name === pkg.json.name);
  if (exists) {
    depPkgs = depPkgs.splice(depPkgs.indexOf(exists));
  }
  depPkgs.push(pkg);
  const returnPackages = [];

  for (let depPkg of depPkgs) {
    if (!resolvedPackages.includes(depPkg)) {
      returnPackages.push(depPkg);
    }
  }
  return returnPackages;
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

  switch (options.order) {
    case "dependency": {
      const rootDependencies = {};
      for (let pkg of packages) {
        rootDependencies[pkg.json.name] = pkg.json.version;
      }

      const rootPackage: MonoRepoPackage = {
        dir: "",
        json: {
          name: "",
          version: "1.0.0",
          dependencies: rootDependencies,
        },
      };
      const orderedPackages = getOrderedDependencyPackages(
        rootPackage,
        packages
      );
      return orderedPackages.filter((p) => p !== rootPackage);
    }
    case "alphabetical":
    default: {
      return packages.sort((a, b) =>
        a.json.name.toLowerCase().localeCompare(b.json.name.toLowerCase())
      );
    }
  }
};
