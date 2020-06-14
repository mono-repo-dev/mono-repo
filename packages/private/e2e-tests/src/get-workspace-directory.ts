import { findMonoRepo, findPackages } from "@mono-repo/utils";

export const getWorkspaceDirectory = async (name: string): Promise<string> => {
  const monoRepo = await findMonoRepo();
  const packages = await findPackages(monoRepo);
  const pkg = packages.find((p) => p.json.name === name);
  if (!pkg) {
    throw new Error(`Workspace with name ${name} not found`);
  }

  return pkg.dir;
};