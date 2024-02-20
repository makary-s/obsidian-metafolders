export type HierarchyImpl<T> = {
	getDataByKey: (key: string) => T | undefined;
	getChildren: (data: T) => Promise<T[]>;
	getParents: (data: T) => Promise<T[]>;
	getKey: (data: T) => string;
};
