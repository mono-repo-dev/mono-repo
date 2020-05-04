export interface MonoRepo {
  dir: string;
  packageGlobs: string[];
}

export interface MonoRepoPackage {
  dir: string;
  json: Package;
}

export interface Package {
  name: string;
  version: string;
  description?: string;
  keywords?: string[];
  homepage?: string;
  bugs?: {
    url: string;
    email: string;
  };
  license?: string;
  author?: string | PackagePerson;
  contributors?: string[] | PackagePerson[];
  files?: string[];
  main?: string;
  browser?: string;
  bin?: string | PackageKeyValueMap<string>;
  man?: string | string[];
  directories?: PackageDirectories;
  repository?: string | PackageRepository;
  scripts?: PackageKeyValueMap<string>;
  config?: PackageKeyValueMap<string>;
  dependencies?: PackageKeyValueMap<string>;
  devDependencies?: PackageKeyValueMap<string>;
  peerDependencies?: PackageKeyValueMap<string>;
  bundledDependencies?: string[];
  optionalDependencies?: PackageKeyValueMap<string>;
  engines?: PackageKeyValueMap<string>;
  os?: string[];
  cpu?: string[];
  private?: boolean;
  publishConfig?: PackagePublishConfig;
  [key: string]: unknown;
  workspaces?: string[] | PackageWorkspaces;
}

export interface PackagePerson {
  name?: string;
  email?: string;
  url?: string;
}

export interface PackageKeyValueMap<Value> {
  [key: string]: Value;
}

export interface PackageDirectories {
  bin?: string;
  doc?: string;
  lib?: string;
  man?: string;
  example?: string;
  test?: string;
}

export interface PackageRepository {
  type?: string;
  url: string;
  directory?: string;
}

export interface PackagePublishConfig {
  access?: "private" | "public";
  registry?: string;
}

export interface PackageWorkspaces {
  packages?: string[];
  noihoist?: string[];
}
