import { useEffect, useState } from "react";
import { AtomObject } from "src/models/atom";

export const useAtomObject = <T, K extends keyof T>(
	atom: AtomObject<T>,
	key: K,
): T[K] => {
	const [value, setValue] = useState(atom.get(key));

	useEffect(() => atom.subscribeProperty(key, setValue), []);

	return value;
};
