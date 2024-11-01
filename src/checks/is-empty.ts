import { isEmptyArray, isEmptyObject, isEmptyString, isNullOrUndefined } from '.';

export const isEmpty = (item: unknown): boolean => {
	return isNullOrUndefined(item) || isEmptyObject(item) || isEmptyString(item) || isEmptyArray(item);
};
