export const isEmptyArray = (item: unknown): item is [] => {
  return Array.isArray(item) && item.length === 0;
};
