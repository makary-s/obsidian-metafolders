import { useStore } from "zustand";
import { StoreApi, createStore } from "zustand/vanilla";

export type FileData = {
	expanded: boolean;
	highlighted: boolean;
};

const filesDataStores = {
	highlighted: {
		store: createStore<Record<string, boolean>>()(() => ({})),
		default: false,
	},
	expanded: {
		store: createStore<Record<string, boolean>>()(() => ({})),
		default: false,
	},
	exists: {
		store: createStore<Record<string, null | string>>()(() => ({})),
		default: null,
	},
};

type RecordStore<T> = {
	store: StoreApi<Record<string, T>>;
	default: T;
};

const createRecordStore = <T>(recordStore: RecordStore<T>) => ({
	get: (key: string): T =>
		recordStore.store.getState()[key] ?? recordStore.default,
	set: (key: string, value: T | ((current: T) => T)): void =>
		recordStore.store.setState((s) => ({
			...s,
			[key]:
				typeof value === "function"
					? (value as (current: T) => T)(s[key])
					: value,
		})),
	useStore: (key: string) =>
		[
			useStore(recordStore.store, (s) => s[key] ?? recordStore.default),
			(value: T | ((current: T) => T)) =>
				recordStore.store.setState((s) => ({
					...s,
					[key]:
						typeof value === "function"
							? (value as (current: T) => T)(s[key])
							: value,
				})),
		] as const,
});

export const filesData = {
	highlighted: createRecordStore(filesDataStores.highlighted),
	expanded: createRecordStore(filesDataStores.expanded),
	exists: createRecordStore(filesDataStores.exists),
};
