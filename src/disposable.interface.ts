export interface IDisposable {
  dispose(): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isDisposable(value: any): value is IDisposable {
	return value && typeof value.dispose === 'function';
}