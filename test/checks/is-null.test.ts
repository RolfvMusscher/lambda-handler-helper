import { isNull } from "../../src/checks/is-null";

describe("isNull", () => {
  const shouldBeTruthy = [null];
  shouldBeTruthy.forEach((val) =>
    it(`checks correctly that ${String(val)} is thruthy`, () => {
      expect(isNull(val)).toBeTruthy();
    }),
  );

  const shouldBeFalsy = [
    { foo: { bar: "foo" } },
    "string",
    [[]],
    "",
    0,
    undefined,
  ];
  shouldBeFalsy.forEach((val) =>
    it(`checks correctly that ${String(val)} is falsy`, () => {
      expect(isNull(val)).toBeFalsy();
    }),
  );
});
