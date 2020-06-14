export const checkSyncAndParallel = (argv: any) => {
  if (argv.sync && argv.parallel) {
    throw new Error("Arguments sync and parallel are mutually exclusive");
  }

  return true;
};
