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

CLI tool for managing mono repos.

## Commands

```sh
mono-repo list
mono-repo run test --args --passWithNoTests
mono-repo run test --parallel
mono-repo run test --sync
mono-repo run test --no-bail
mono-repo plan test
mono-repo plan test --parallel
mono-repo add @tunstall/ui-core
mono-repo add @tunstall/ui-core --include @tunstall/app
mono-repo add @tunstall/ui-core --include @tunstall/lib-*
mono-repo remove @tunstall/ui-core
mono-repo remove @tunstall/ui-core --include @tunstall/app
mono-repo remove @tunstall/ui-core --include @tunstall/lib-*
```
