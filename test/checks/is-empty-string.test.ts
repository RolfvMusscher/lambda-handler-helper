import { isEmptyString } from "../../src/checks/is-empty-string";

describe("isEmptyString", () => {
  const shouldBeTruthy = [""];
  shouldBeTruthy.forEach((val) =>
    it(`checks correctly that ${String(val)} is thruthy`, () => {
      expect(isEmptyString(val)).toBeTruthy();
    }),
  );

  const shouldBeFalsy = [{}, undefined, null, "string"];
  shouldBeFalsy.forEach((val) =>
    it(`checks correctly that ${String(val)} is falsy`, () => {
      expect(isEmptyString(val)).toBeFalsy();
    }),
  );
});
