export const extractArgsOptionArgs = (argv: any) => {
  const argsIndex = process.argv.indexOf("--args");
  if (argsIndex !== -1) {
    argv.args = process.argv.slice(argsIndex + 1);
  }

  return argv;
};
