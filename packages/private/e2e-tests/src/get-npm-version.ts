import { spawnSync } from "child_process";

export const getNpmVersion = (packageName: string) => {
  return spawnSync("npm", ["show", packageName, "version"], {
    encoding: "utf8",
  }).stdout.split("\n")[0];
};
