import { useEffect, useState } from "react";
import { Atom, AtomCollection, AtomObject } from "src/models/atom";

export const useAtom = <T>(atom: Atom<T>): T => {
	const [value, setValue] = useState(atom.get());

	useEffect(() => atom.subscribe(setValue), []);

	return value;
};

export const useAtomCollection = <T>(
	atom: AtomCollection<T>,
	id: string,
): T => {
	const [value, setValue] = useState(atom.get(id));

	useEffect(() => atom.subscribe(id, setValue), []);

	return value;
};

export const useAtomObject = <T, K extends keyof T>(
	atom: AtomObject<T>,
	key: K,
): T[K] => {
	const [value, setValue] = useState(atom.get(key));

	useEffect(() => atom.subscribeProperty(key, setValue), []);

	return value;
};
