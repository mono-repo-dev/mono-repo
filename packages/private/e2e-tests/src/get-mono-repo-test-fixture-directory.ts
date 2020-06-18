import { findMonoRepo, findPackages } from "@mono-repo/utils";

export const getMonoRepoTextFixtureDirectory = async (
  name: string
): Promise<string> => {
  const monoRepo = await findMonoRepo();
  const packages = await findPackages(monoRepo);
  const pkg = packages.find((p) => p.json.name === name);
  if (!pkg) {
    throw new Error(`Mono repo with name ${name} not found`);
  }

  return pkg.dir;
};
