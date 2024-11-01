import { isDefined } from '../../src/checks/is-defined';

describe('isDefined', () => {
  const shouldBeDefined = [{}, [], '', 0, NaN];
  shouldBeDefined.forEach((val) =>
    it(`checks correctly that ${String(val)} is defined`, () => {
      expect(isDefined(val)).toBeTruthy();
    })
  );

  const shouldNotBeDefined = [undefined, null];
  shouldNotBeDefined.forEach((val) =>
    it(`checks correctly that ${String(val)} is not defined`, () => {
      expect(isDefined(val)).toBeFalsy();
    })
  );
});
