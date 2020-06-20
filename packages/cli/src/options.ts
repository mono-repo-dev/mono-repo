interface YargsOption {
  type?: "string" | "number" | "boolean" | "array" | "count";
  default?: any;
  describe: string;
  hidden?: boolean;
}

const createOption = (option: YargsOption): YargsOption => option;

export const options = {
  args: createOption({
    describe: "Capture args to forward",
  }),
  // Proxy for no-bail
  bail: createOption({
    describe: "Proxy for no-bail",
    default: true,
    hidden: true,
    type: "boolean",
  }),
  dev: createOption({
    describe: "Install dev dependency",
    default: false,
    type: "boolean",
  }),
  exact: createOption({
    describe: "Install dev dependency at exact version",
    default: false,
    type: "boolean",
  }),
  "no-bail": createOption({
    describe: "Do not exit on script failures",
    default: false,
    type: "boolean",
  }),
  parallel: createOption({
    describe: "Process all packages in parallel",
    default: false,
    type: "boolean",
  }),
  peer: createOption({
    describe: "Install peer dependency",
    default: false,
    type: "boolean",
  }),
  stream: createOption({
    describe: "Stream logs in real time",
    default: false,
    type: "boolean",
  }),
  sync: createOption({
    describe: "Process all packages in sync",
    default: false,
    type: "boolean",
  }),
};
