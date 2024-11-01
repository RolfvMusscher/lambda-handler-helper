import { isNullOrUndefined } from '.';

/**
 * Used to check if a value of any type is defined
 *
 * @template T
 * @param {(T | undefined)} item
 * @return {*}  {item is T}
 */
export const isDefined = <T>(item: T | undefined | null): item is T => !isNullOrUndefined(item);

/**
 * Returns the value when the value is default, if not, returns the second parameter
 *
 * @template T The type
 * @param {T} item The array with items of type T
 * @param {T} defaultValue The property used for sorting
 * @return {T} item or defaultValue
 */
export function valueIfDefined<T>(item: T | undefined, defaultValue: T): T {
	return isDefined(item) ? item : defaultValue;
}
