export const getMapDefault = <K, V, D extends () => V>(
	obj: Map<K, V>,
	key: K,
	getDefault: D,
): V => {
	return obj.get(key) ?? obj.set(key, getDefault()).get(key)!;
};

export const createPromise = <T>(): Promise<T> & {
	resolve: (value: T) => void;
	reject: (error: unknown) => void;
} => {
	let resolve: (value: T) => void;
	let reject: (error: unknown) => void;

	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return Object.assign(promise, { resolve: resolve!, reject: reject! });
};

export const createEmptySet = <T>() => new Set<T>();

/** Returns added and deleted values */
export const getSetDiff = <T>(oldSet: Set<T>, newSet: Set<T>): Set<T> => {
	const updated = new Set([...oldSet]);

	for (const newItem of newSet.values()) {
		if (updated.has(newItem)) {
			updated.delete(newItem);
		} else {
			updated.add(newItem);
		}
	}

	return updated;
};

export const keys = <T extends Record<any, any>>(obj: T) => {
	return Object.keys(obj) as Array<keyof T>;
};

export const clampNumber = (value: number, min: number, max: number) => {
	return Math.min(max, Math.max(min, value));
};

export const join = (
	values: Array<string | boolean | null | undefined>,
	separator = " ",
): string => {
	let result = "";

	for (const value of values) {
		if (value) {
			if (result) result += separator;
			result += value;
		}
	}

	return result;
};
