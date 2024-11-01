import { isNotZeroNumber } from "../../src/checks/is-not-zero-number";

describe("isNotZeroNumber", () => {
  const shouldBeTruthy = [1, 2.3, 10000];
  shouldBeTruthy.forEach((val) =>
    it(`checks correctly that ${String(val)} is thruthy`, () => {
      expect(isNotZeroNumber(val)).toBeTruthy();
    }),
  );

  const shouldBeFalsy = [NaN, 0];
  shouldBeFalsy.forEach((val) =>
    it(`checks correctly that ${String(val)} is falsy`, () => {
      expect(isNotZeroNumber(val)).toBeFalsy();
    }),
  );
});
