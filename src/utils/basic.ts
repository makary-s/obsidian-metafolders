export const getMapDefault = <K, V, D extends () => V>(
	obj: Map<K, V>,
	key: K,
	getDefault: D,
): V => {
	return obj.get(key) ?? obj.set(key, getDefault()).get(key)!;
};
