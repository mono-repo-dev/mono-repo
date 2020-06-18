import { spawnSync } from "child_process";
import path from "path";
import fs from "fs-extra";
import { findMonoRepo, findPackages } from "@mono-repo/utils";

interface AddCommandOptions {
  dev: boolean;
  package: string;
  peer: boolean;
}

export const add = async (options: AddCommandOptions) => {
  const monoRepo = await findMonoRepo();
  const packages = await findPackages(monoRepo, { order: "alphabetical" });
  const cwd = process.cwd();

  const targetPackage = packages.find((p) => p.dir === cwd);
  if (!targetPackage) {
    throw new Error("Not in a package directory.");
  }

  const packageParts = options.package.split("@");
  const packageName = packageParts[0];
  const localPackage = packages.find((p) => p.json.name === packageName);

  if (localPackage) {
    const writePackageJson = targetPackage.json;
    if (options.dev) {
      if (!writePackageJson.devDependencies) {
        writePackageJson.devDependencies = {};
      }

      writePackageJson.devDependencies[localPackage.json.name] =
        localPackage.json.version;
    } else if (options.peer) {
      if (!writePackageJson.peerDependencies) {
        writePackageJson.peerDependencies = {};
      }

      writePackageJson.peerDependencies[localPackage.json.name] =
        localPackage.json.version;
    } else {
      if (!writePackageJson.dependencies) {
        writePackageJson.dependencies = {};
      }

      writePackageJson.dependencies[localPackage.json.name] =
        localPackage.json.version;
    }

    await fs.writeJSON(
      path.resolve(targetPackage.dir, "package.json"),
      writePackageJson,
      { encoding: "utf8", spaces: 2 }
    );
    spawnSync("yarn", [], { cwd, encoding: "utf8" });
  } else {
    const args = [
      "add",
      options.package,
      options.dev && "--dev",
      options.peer && "--peer",
    ].filter(Boolean);
    spawnSync("yarn", args, { cwd, encoding: "utf8" });
  }
};
