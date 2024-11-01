import { isNullOrUndefined } from './is-null-or-undefined';

export function isTrue(value: string | number | boolean | undefined): boolean {
	if (isNullOrUndefined(value)) {
		return false;
	}
	return ['true', true, 1].includes(value);
}
