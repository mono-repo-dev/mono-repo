interface YargsPositional {
  type?: "string" | "number" | "boolean";
  describe: string;
}

const createPositional = (option: YargsPositional): YargsPositional => option;

export const positionals = {
  package: createPositional({
    describe: "Package to install",
    type: "string",
  }),
  script: createPositional({
    describe: "Script to run",
    type: "string",
  }),
};
