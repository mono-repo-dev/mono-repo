interface YargsOption {
  type?: "string" | "number" | "boolean" | "array" | "count";
  default?: any;
  describe: string;
  hidden?: boolean;
}

interface YargsPositional {
  type?: "string" | "number" | "boolean";
  describe: string;
}

const createOption = (option: YargsOption): YargsOption => option;
const createPositional = (option: YargsPositional): YargsPositional => option;

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

export const positionals = {
  script: createPositional({
    describe: "Script to run",
    type: "string",
  }),
};
