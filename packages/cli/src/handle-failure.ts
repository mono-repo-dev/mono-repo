import type { Argv } from "yargs";
import chalk from "chalk";

export const handleFailure = (
  message: string,
  error: Error | string | undefined,
  yargs: Argv
) => {
  if (message) {
    console.error(yargs.help());
    console.error();
    console.error(chalk.redBright(message));
  } else {
    console.error(chalk.redBright(error?.toString()));
  }

  process.exit(1);
};
