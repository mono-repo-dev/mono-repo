import { checkSyncAndParallel } from "../checks";

describe("checks", () => {
  describe("checkSyncAndParallel", () => {
    it("should enforce only sync or parallel is provided", () => {
      expect(() => {
        checkSyncAndParallel({
          parallel: true,
          sync: true,
        });
      }).toThrowError("Arguments sync and parallel are mutually exclusive");
    });
  });
});
