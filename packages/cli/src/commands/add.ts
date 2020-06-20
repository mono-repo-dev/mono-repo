import { spawnSync } from "child_process";
import path from "path";
import fs from "fs-extra";
import { findMonoRepo, findPackages } from "@mono-repo/utils";
import { orderPackageKeyValueMap } from "../order-package-key-value-map";

interface AddCommandOptions {
  dev: boolean;
  exact: boolean;
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

  const isScoped = options.package.startsWith("@");
  let isVersionSpecified = false;
  const packageParts = options.package.split("@");
  const packageName = `${isScoped ? "@" : ""}${packageParts[0]}${
    packageParts[1] ?? ""
  }`;

  isVersionSpecified = isScoped
    ? packageParts.length === 3
    : packageParts.length === 2;

  const localPackage = packages.find((p) => p.json.name === packageName);

  if (localPackage) {
    let packageVersion = isVersionSpecified
      ? packageParts[packageParts.length - 1]
      : `${options.exact ? "" : "^"}${localPackage.json.version}`;

    const writePackageJson = targetPackage.json;
    if (options.dev) {
      if (!writePackageJson.devDependencies) {
        writePackageJson.devDependencies = {};
      }

      writePackageJson.devDependencies[localPackage.json.name] = packageVersion;
      writePackageJson.devDependencies = orderPackageKeyValueMap(
        writePackageJson.devDependencies
      );
    } else if (options.peer) {
      if (!writePackageJson.peerDependencies) {
        writePackageJson.peerDependencies = {};
      }

      writePackageJson.peerDependencies[
        localPackage.json.name
      ] = packageVersion;
      writePackageJson.peerDependencies = orderPackageKeyValueMap(
        writePackageJson.peerDependencies
      );
    } else {
      if (!writePackageJson.dependencies) {
        writePackageJson.dependencies = {};
      }

      writePackageJson.dependencies[localPackage.json.name] = packageVersion;
      writePackageJson.dependencies = orderPackageKeyValueMap(
        writePackageJson.dependencies
      );
    }

    console.log(JSON.stringify(writePackageJson, null, 2));
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
      options.dev ? "--dev" : "",
      options.peer ? "--peer" : "",
      options.exact ? "--exact" : "",
    ].filter((s) => s.length > 0);
    const r = spawnSync("yarn", args, {
      cwd,
      encoding: "utf8",
    });
    console.log(r.stderr);
    console.log(r.stdout);
  }
};
