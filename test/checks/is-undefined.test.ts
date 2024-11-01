import { isUndefined } from "../../src/checks/is-undefined";

describe("isUndefined", () => {
  const shouldBeTruthy = [undefined];
  shouldBeTruthy.forEach((val) =>
    it(`checks correctly that ${String(val)} is thruthy`, () => {
      expect(isUndefined(val)).toBeTruthy();
    }),
  );

  const shouldBeFalsy = [{ foo: { bar: "foo" } }, "string", [[]], "", 0, null];
  shouldBeFalsy.forEach((val) =>
    it(`checks correctly that ${String(val)} is falsy`, () => {
      expect(isUndefined(val)).toBeFalsy();
    }),
  );
});
