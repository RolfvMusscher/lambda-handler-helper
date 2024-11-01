import { isTrue } from "../../src/checks/is-true";

describe("isTrue", () => {
  const shouldBeTruthy = [true, "true", 1];
  shouldBeTruthy.forEach((val) =>
    it(`checks correctly that ${String(val)} is thruthy`, () => {
      expect(isTrue(val)).toBeTruthy();
    }),
  );

  const shouldBeFalsy = ["", "string", "false", false, undefined, 0, 10, -1];
  shouldBeFalsy.forEach((val) =>
    it(`checks correctly that ${String(val)} is falsy`, () => {
      expect(isTrue(val)).toBeFalsy();
    }),
  );
});
