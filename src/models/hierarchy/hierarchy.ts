import { HierarchyNode } from "./node";
import { HierarchyImpl } from "./impl";

class HierarchyError extends Error {}

export type HierarchyProps<T> = {
	registry: Map<string, HierarchyNode<T>>;
	impl: HierarchyImpl<T>;
};

export type HierarchyCreateProps<T> = {
	impl: HierarchyImpl<T>;
};

// TODO: add registry garbage collection
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

		const newNode = HierarchyNode.create({
			data,
			hierarchy: this,
			impl: this.p.impl,
		});

		this.p.registry.set(key, newNode);

		return newNode;
	}
}
