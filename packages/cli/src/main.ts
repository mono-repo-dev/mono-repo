#!/usr/bin/env node

import yargs from "yargs";
import { handleFailure } from "./handle-failure";
import { list } from "./commands";

yargs
  .scriptName("mono-repo")
  .fail(handleFailure)
  .command(
    "list",
    "List packages",
    (yargs) => yargs,
    async () => {
      await list();
    }
  ).argv;
