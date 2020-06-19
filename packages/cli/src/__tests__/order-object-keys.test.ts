import { orderPackageKeyValueMap } from "../order-package-key-value-map";

describe("orderPackageKeyValueMap", () => {
  it("should order map keys", () => {
    expect(
      Object.keys(
        orderPackageKeyValueMap({
          b: "",
          c: "",
          a: "",
        })
      )
    ).toEqual(["a", "b", "c"]);
  });
});
