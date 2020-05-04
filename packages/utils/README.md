# @mono-repo/utils

Utilities to aid writing Node.js scripts and tools for mono repos.

# Getting started

```sh
yarn add @mono-repo/utils
```

# Usage

```ts
import { findMonoRepo, findPackages } from "@mono-repo/utils";

const monoRepo = await findMonoRepo({
  cwd: process.cwd(), // default
});

console.log(monoRepo);

/**
 * {
 *   dir: "/absolute/path/to/root",
 *   packageGlobs: ["packages/**"],
 * }
 */

const packages = await findPackages(monoRepo);

console.log(packages);

/**
 * [
 *   {
 *     dir: "/absolute/path/to/package/a",
 *     json: {
 *       name: "a",
 *       version: "1.0.0",
 *       license: "MIT",
 *       public: true,
 *       dependencies: {
 *         "@ts-engine/cli": "1.3.1"
 *       }
 *     }
 *   },
 *   {
 *     dir: "/absolute/path/to/package/b",
 *     json: {
 *       name: "b",
 *       version: "1.0.0",
 *       license: "MIT",
 *       public: true,
 *       dependencies: {
 *         "@ts-engine/cli": "1.3.1"
 *       }
 *     }
 *   }
 * ]
 */
```
