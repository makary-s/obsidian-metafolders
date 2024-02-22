import { useEffect, useState } from "react";
import { Atom, AtomCollection } from "src/models/atom";

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
