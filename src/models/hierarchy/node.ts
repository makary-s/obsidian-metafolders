import { getSetDiff } from "src/utils/basic";
import { Relation } from "./types";
import { Hierarchy } from "./hierarchy";
import { HierarchyImpl } from "./impl";
import { getOppositeRelation } from "./helpers";

export interface HierarchyNodeCreateProps<T> {
	hierarchy: Hierarchy<T>;
	impl: HierarchyImpl<T>;
	data: T;
}

export interface HierarchyNodeProps<T> {
	hierarchy: Hierarchy<T>;
	impl: HierarchyImpl<T>;
	data: T;

	relatives: Record<Relation, Set<string>>;
	subscriptions: Record<Relation, Set<SubscribeFn<T>>>;
	lastUpdated: Record<Relation, null | number>;
}

export type SubscribeFn<T> = (node: HierarchyNode<T>) => void;

export class HierarchyNode<T> {
	static create<T>(p: HierarchyNodeCreateProps<T>): HierarchyNode<T> {
		return new HierarchyNode({
			...p,
			relatives: {
				child: new Set(),
				parent: new Set(),
			},
			subscriptions: {
				child: new Set(),
				parent: new Set(),
			},
			lastUpdated: {
				child: null,
				parent: null,
			},
		});
	}

	protected constructor(protected p: HierarchyNodeProps<T>) {}

	get data(): T {
		return this.p.data;
	}

	get key(): string {
		return this.p.impl.getKey(this.data);
	}

	getRelatives(relation: Relation): HierarchyNode<T>[] {
		const result = [] as HierarchyNode<T>[];

		const relatives = this.p.relatives[relation];

		for (const path of relatives) {
			const child = this.p.hierarchy.getNode(path);
			result.push(child);
		}

		return result;
	}

	subscribe(relation: Relation, cb: SubscribeFn<T>): () => void {
		this.p.subscriptions[relation].add(cb);

		return () => this.p.subscriptions[relation].delete(cb);
	}

	protected dispatch(relation: Relation) {
		this.p.subscriptions[relation].forEach((cb) => cb(this));
	}

	protected fetchRelatives(relation: Relation): Promise<T[]> {
		switch (relation) {
			case "child":
				return this.p.impl.getChildren(this.data);
			case "parent":
				return this.p.impl.getParents(this.data);
		}
	}

	async updateSpecificRelatives(
		relation: Relation,
		updateInitialTime = Date.now(),
	) {
		if (updateInitialTime === this.p.lastUpdated[relation]) return;
		this.p.lastUpdated[relation] = updateInitialTime;

		const items = await this.fetchRelatives(relation);

		const newItems = new Set(items.map((data) => this.p.impl.getKey(data)));
		const updatedItems = getSetDiff(this.p.relatives[relation], newItems);

		this.p.relatives[relation] = newItems;

		updatedItems.forEach((item) => {
			this.p.hierarchy
				.getNode(item)
				.updateSpecificRelatives(
					getOppositeRelation(relation),
					updateInitialTime,
				);
		});

		if (updatedItems.size > 0) {
			this.dispatch(relation);
		}
	}

	async updateRelatives(updateInitialTime = Date.now()) {
		await Promise.all([
			this.updateSpecificRelatives("child", updateInitialTime),
			this.updateSpecificRelatives("parent", updateInitialTime),
		]);
	}
}
