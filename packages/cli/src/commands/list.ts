import { findMonoRepo, findPackages } from "@mono-repo/utils";

export const list = async () => {
  const monoRepo = await findMonoRepo();
  const packages = await findPackages(monoRepo, { order: "alphabetical" });

  console.log(packages.map((p) => p.json.name).join("\n"));
};
