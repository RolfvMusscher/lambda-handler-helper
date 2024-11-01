import { isEmpty } from '../../src/checks/is-empty';

describe('isEmpty', () => {
	const shouldBeTruthy = ['', {}, [], undefined, null];
	shouldBeTruthy.forEach((val) =>
		it(`checks correctly that ${String(val)} is thruthy`, () => {
			expect(isEmpty(val)).toBeTruthy();
		}),
	);

	const shouldBeFalsy = [{ foo: { bar: 'foo' } }, 'string', [[]]];
	shouldBeFalsy.forEach((val) =>
		it(`checks correctly that ${String(val)} is falsy`, () => {
			expect(isEmpty(val)).toBeFalsy();
		}),
	);
});
