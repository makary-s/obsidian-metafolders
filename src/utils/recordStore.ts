import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

export const createCollectionStore = <T>(initialValue: T) => {
	const store = createStore<Record<string, T>>()(() => ({}));

	const set = (key: string, value: T | ((current: T) => T)): void =>
		store.setState((s) => ({
			...s,
			[key]:
				typeof value === "function"
					? (value as (current: T) => T)(s[key])
					: value,
		}));

	return {
		get: (key: string): T => store.getState()[key] ?? initialValue,
		set,
		useStore: (key: string) =>
			[
				useStore(store, (s) => s[key] ?? initialValue),
				(value: T | ((current: T) => T)) => set(key, value),
			] as const,
	};
};
