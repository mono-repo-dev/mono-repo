import type { PackageKeyValueMap } from "@mono-repo/utils";

export const orderPackageKeyValueMap = (
  map: PackageKeyValueMap<string>
): PackageKeyValueMap<string> => {
  const orderedObject: PackageKeyValueMap<string> = {};
  Object.keys(map)
    .sort()
    .forEach((key) => {
      orderedObject[key] = map[key];
    });

  return orderedObject;
};
