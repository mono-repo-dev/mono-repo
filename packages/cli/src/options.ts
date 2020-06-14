interface YargsOption {
  type?: "string" | "number" | "boolean" | "array" | "count";
  default?: any;
  describe: string;
}

const createOption = (option: YargsOption): YargsOption => option;

export const options = {
  parallel: createOption({
    describe: "Run in parallel in safe batches",
    default: false,
    type: "boolean",
  }),
};
