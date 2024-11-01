import { isEmptyObject } from "../../src/checks/is-empty-object";

describe("isEmptyObject", () => {
  const shouldBeTruthy = [{}];
  shouldBeTruthy.forEach((val) =>
    it(`checks correctly that ${String(val)} is thruthy`, () => {
      expect(isEmptyObject(val)).toBeTruthy();
    }),
  );

  const shouldBeFalsy = [{ foo: "bar" }, undefined, null, ""];
  shouldBeFalsy.forEach((val) =>
    it(`checks correctly that ${String(val)} is falsy`, () => {
      expect(isEmptyObject(val)).toBeFalsy();
    }),
  );
});
