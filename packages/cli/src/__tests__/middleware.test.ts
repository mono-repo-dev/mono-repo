import { extractArgsOptionArgs } from "../middleware";

describe("middleware", () => {
  describe("extractArgsOptionArgs", () => {
    const orginalArgv = process.argv;

    afterEach(() => {
      process.argv = orginalArgv;
    });

    it("should set args", () => {
      process.argv = ["ts-engine", "start", "--args", "--one", "-two", "three"];

      expect(extractArgsOptionArgs({})).toEqual({
        args: ["--one", "-two", "three"],
      });
    });

    it("should not set args", () => {
      process.argv = [
        "ts-engine",
        "start",
        "--not-args",
        "--one",
        "-two",
        "three",
      ];

      expect(extractArgsOptionArgs({})).toEqual({});
    });
  });
});
