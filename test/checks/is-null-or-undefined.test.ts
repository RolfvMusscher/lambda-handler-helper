import { isNullOrUndefined } from '../../src/checks/is-null-or-undefined';

describe('isNullOrUndefined', () => {
	const shouldBeTruthy = [undefined, null];
	shouldBeTruthy.forEach((val) =>
		it(`checks correctly that ${String(val)} is thruthy`, () => {
			expect(isNullOrUndefined(val)).toBeTruthy();
		}),
	);

	const shouldBeFalsy = [{ foo: { bar: 'foo' } }, 'string', [[]], '', 0];
	shouldBeFalsy.forEach((val) =>
		it(`checks correctly that ${String(val)} is falsy`, () => {
			expect(isNullOrUndefined(val)).toBeFalsy();
		}),
	);
});
