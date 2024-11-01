import { isNull, isUndefined } from '.';

export const isNullOrUndefined = (item: unknown): item is undefined | null => {
	return isNull(item) || isUndefined(item);
};
