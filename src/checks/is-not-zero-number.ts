export const isNotZeroNumber = (item: unknown): boolean => {
	return typeof item === 'number' && !isNaN(item) && item !== 0;
};
