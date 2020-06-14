import { spawn } from "child_process";
import chalk from "chalk";

interface RunCliCommandOptions {
  stream: boolean;
  cwd: string;
  logPrefix: string;
}

export const runCliCommand = (
  command: string,
  args: string[],
  options: RunCliCommandOptions
): Promise<number> => {
  return new Promise((resolve, reject) => {
    const logs: string[] = [];
    const runner = spawn(command, args, {
      cwd: options.cwd,
      stdio: "pipe",
    });

    runner.stdout.setEncoding("utf8");
    runner.stderr.setEncoding("utf8");

    const handleData = (data: string) => {
      const lines = data
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l !== "")
        .map((l) => `${chalk.yellowBright(options.logPrefix)}${l}`);

      if (options.stream) {
        console.log(lines.join("\n"));
      } else {
        logs.push(...lines);
      }
    };

    runner.stdout.on("data", handleData);
    runner.stderr.on("data", handleData);

    runner.on("close", (code) => {
      if (!options.stream) {
        if (code === 0) {
          console.log(logs.join("\n"));
        } else {
          console.error(logs.join("\n"));
        }
      }

      code === 0 ? resolve(code) : reject(code);
    });
  });
};
