# <p align="center">

<img 
    src="https://raw.githubusercontent.com/mono-repo-dev/assets/master/logo-alt.png"
    alt="mono-repo logo" 
    width="130"
    height="141"
  />

</p>
<h1 align="center"> @mono-repo/cli</h1>
<p align="center">
  <img style="display: inline-block; margin-right: 5px;" src="https://github.com/mono-repo-dev/mono-repo/workflows/Verify/badge.svg" />
  <img style="display: inline-block; margin-right: 5px;" src="https://github.com/mono-repo-dev/mono-repo/workflows/Publish/badge.svg" />
  <img style="display: inline-block; margin-right: 5px;" src="https://badgen.net/github/release/mono-repo-dev/mono-repo" />
</p>

CLI tool for managing mono repos powered by Yarn Workspaces.

## Commands

### list

List all packages in mono repo.

```sh
# List packages out in alphabetical order.
mono-repo list
```

### run

Run scripts in packages.

```sh
# Run an NPM script in all packages.
# By default packages are run in an efficient
# optimal order parallelizing scripts where it is safe.
mono-repo run <script>

# Run an NPM script in all packages in parallel.
# This ignores the dependency tree so be careful.
mono-repo run <script> --parallel

# Run an NPM script in all packages in sync.
# This obeys the dependency tree.
mono-repo run <script> --sync

# Stream logs out in real time, logs from various packages
# can intermingle when not running in sync.
mono-repo run <script> --stream

# Don't exit with a non-zero error code if an NPM script fails.
# This is useful if you want to run all tests in a pipeline and
# gather all results even if an earlier packages tests failed.
mono-repo run <script> --no-bail

# Forward args onto all NPM scripts.
mono-repo run <script> --args --forward --this --and --that
```

### add

Add a remote or local package to a package.

**Note this only supports adding a single package at a time.**

```sh
# Add package
mono-repo add <package>

# Add package at version
mono-repo add <package>@<version>

# Add as dev dependency
mono-repo add <package> --dev

# Add as peer dependency
mono-repo add <package> --peer

# Add exact version
mono-repo add <package> --exact
```
