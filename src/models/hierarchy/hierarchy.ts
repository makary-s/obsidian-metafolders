import type { HierarchyImpl } from "./impl";
import type { HierarchyNode } from "./node";
import { HierarchyError } from "./constants";

export type HierarchyProps = {
	registry: Map<string, HierarchyNode>;
	impl: HierarchyImpl;
};

export type HierarchyCreateProps = {
	impl: HierarchyImpl;
};

export class Hierarchy {
	protected constructor(protected p: HierarchyProps) {}

	static create(p: HierarchyCreateProps): Hierarchy {
		return new Hierarchy({ impl: p.impl, registry: new Map() });
	}

	getNode(key: string): HierarchyNode {
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

	getNodeSafe(key: string): HierarchyNode | undefined {
		return this.p.registry.get(key);
	}

	deleteNode(key: string): void {
		const node = this.p.registry.get(key);
		this.p.registry.delete(key);
		node?.updateSpecificRelatives("parent");
	}
}
