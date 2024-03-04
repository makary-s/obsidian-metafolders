import type { HierarchyImpl } from "./impl";
import type { HierarchyNode } from "./node";
import { HierarchyError } from "./constants";

export type HierarchyProps<T> = {
	registry: Map<string, HierarchyNode<T>>;
	impl: HierarchyImpl<T>;
};

export type HierarchyCreateProps<T> = {
	impl: HierarchyImpl<T>;
};

export class Hierarchy<T> {
	protected constructor(protected p: HierarchyProps<T>) {}

	static create<T>(p: HierarchyCreateProps<T>): Hierarchy<T> {
		return new Hierarchy({ impl: p.impl, registry: new Map() });
	}

	getNode(key: string) {
		const node = this.p.registry.get(key);

		if (node) {
			return node;
		}

		const data = this.p.impl.getDataByKey(key);

		if (!data) {
			throw new HierarchyError(`Data not found: ${key}`);
		}

		const newNode = this.p.impl.createNode({
			data,
			hierarchy: this,
			impl: this.p.impl,
		});

		this.p.registry.set(key, newNode);

		return newNode;
	}
}
