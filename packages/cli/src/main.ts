#!/usr/bin/env node

import yargs from "yargs";
import { handleFailure } from "./handle-failure";
import { add, list, run } from "./commands";
import { options } from "./options";
import { positionals } from "./positionals";
import { checkSyncAndParallel } from "./checks";
import { extractArgsOptionArgs } from "./middleware";

yargs
  .scriptName("mono-repo")
  .middleware(extractArgsOptionArgs)
  .fail(handleFailure)
  .command(
    "add <package>",
    "Add packages",
    (yargs) => {
      return yargs
        .options({
          dev: options.dev,
          peer: options.peer,
        })
        .positional("package", { ...positionals.package });
    },
    async (argv) => {
      // @ts-ignore
      await add(argv);
    }
  )
  .command(
    "list",
    "List packages",
    (yargs) => {
      return yargs;
    },
    async () => {
      await list();
    }
  )
  .command(
    "run <script>",
    "Execute scripts in packages",
    (yargs) => {
      return yargs
        .options({
          args: options.args,
          bail: options.bail,
          "no-bail": options["no-bail"],
          parallel: options.parallel,
          stream: options.stream,
          sync: options.sync,
        })
        .positional("script", { ...positionals.script })
        .check(checkSyncAndParallel);
    },
    async (argv) => {
      // @ts-ignore
      await run(argv);
    }
  ).argv;
