export const isEmptyObject = (item: unknown): boolean => {
	return item !== null && typeof item === 'object' && Object.keys(item).length === 0;
};
