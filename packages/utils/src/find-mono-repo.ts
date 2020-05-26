import path from "path";
import fs from "fs-extra";
import { MonoRepo, Package } from "./types";

export interface FindMonoRepoOptions {
  cwd: string;
}

const tryExtractPackageGlobs = async (
  pkg: Package
): Promise<string[] | undefined> => {
  const isPrivate = pkg.private === true;
  const hasYarnWorkspacesKey = "workspaces" in pkg;

  // Early exit if the config isn't there
  if (!isPrivate || !hasYarnWorkspacesKey) {
    return undefined;
  }

  return Array.isArray(pkg.workspaces)
    ? pkg.workspaces
    : pkg.workspaces?.packages;
};

export const findMonoRepo = async (
  options: FindMonoRepoOptions = { cwd: process.cwd() }
): Promise<MonoRepo> => {
  const packageJsonFilename = path.resolve(options.cwd, "package.json");
  const packageJsonExists = await fs.pathExists(packageJsonFilename);

  // If a package.json exists at this level then check if it is valid mono repo
  // config and return it if it is
  if (packageJsonExists) {
    const packageJson = (await fs.readJSON(packageJsonFilename)) as Package;
    const packageGlobs = await tryExtractPackageGlobs(packageJson);

    if (packageGlobs) {
      return {
        dir: options.cwd,
        packageGlobs,
      };
    }
  }

  // Not valid mono repo config, so jump up a level and check there
  const directoryUp = path.resolve(options.cwd, "..");

  // If we've reached the top then we are not in a mono repo
  if (directoryUp === options.cwd) {
    throw new Error("Could not find mono repo root directory.");
  }

  // Try again on the next directory up
  return findMonoRepo({ cwd: directoryUp });
};
