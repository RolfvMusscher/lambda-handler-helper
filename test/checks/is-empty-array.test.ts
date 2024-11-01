import { isEmptyArray } from "../../src/checks/is-empty-array";

describe("isEmptyArray", () => {
  const shouldBeTruthy = [[]];
  shouldBeTruthy.forEach((val) =>
    it(`checks correctly that ${String(val)} is thruthy`, () => {
      expect(isEmptyArray(val)).toBeTruthy();
    }),
  );

  const shouldBeFalsy = [[{}], [undefined], [null], ["string"]];
  shouldBeFalsy.forEach((val) =>
    it(`checks correctly that ${String(val)} is falsy`, () => {
      expect(isEmptyArray(val)).toBeFalsy();
    }),
  );
});
