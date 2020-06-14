#!/usr/bin/env node

import yargs from "yargs";
import { handleFailure } from "./handle-failure";
import { list, plan } from "./commands";
import { options } from "./options";

yargs
  .scriptName("mono-repo")
  .fail(handleFailure)
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
    "plan",
    "Display execution plan",
    (yargs) => {
      return yargs.options({ parallel: options.parallel });
    },
    async (argv) => {
      // @ts-ignore
      await plan(argv);
    }
  ).argv;
