import path from "path";
import fs from "fs-extra";
import glob from "glob-promise";
import { MonoRepo, MonoRepoPackage, Package } from "./types";

export const findPackages = async (
  monoRepo: MonoRepo
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
  const packages = await Promise.all(
    packageJsonFilepaths.map((x: string): Promise<Package> => fs.readJson(x))
  );

  // Apply package meta data on the way out
  return packages.map(
    (x, i): MonoRepoPackage => ({
      dir: packageJsonFilepaths[i].replace("/package.json", ""),
      json: x,
    })
  );
};
