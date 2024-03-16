import { getSetDiff } from "src/utils/basic";
import { Relation } from "./types";
import { Hierarchy } from "./hierarchy";
import { HierarchyImpl } from "./impl";
import { getOppositeRelation } from "./helpers";
import { action, computed, makeObservable, observable } from "mobx";
import { TFile } from "obsidian";
import { randomUUID } from "crypto";

export interface HierarchyNodeProps {
	hierarchy: Hierarchy;
	impl: HierarchyImpl;
	data: TFile;
}

export type SubscribeFn = (node: HierarchyNode) => void;

export type HierarchyNodeStatus = "idle" | "loading" | "ready";

export class HierarchyNode {
	data: TFile;
	id: string = randomUUID();

	status: Record<Relation, HierarchyNodeStatus> = observable({
		child: "idle",
		parent: "idle",
	});

	relatives = {
		child: new Set<HierarchyNode>(),
		parent: new Set<HierarchyNode>(),
	};

	protected hierarchy: Hierarchy;
	protected impl: HierarchyImpl;

	constructor(protected p: HierarchyNodeProps) {
		this.data = p.data;
		this.hierarchy = p.hierarchy;
		this.impl = p.impl;

		makeObservable(this, {
			data: observable,
			relatives: observable,
			updateSpecificRelatives: action,
			hasRelatives: computed.struct,
		});

		this.updateRelatives();
	}

	get path(): string {
		return this.impl.getPath(this.data);
	}

	get hasRelatives(): Record<Relation, boolean> {
		return {
			child: this.relatives.child.size > 0,
			parent: this.relatives.parent.size > 0,
		};
	}

	hasRelative(relation: Relation, node: HierarchyNode): boolean {
		return this.relatives[relation].has(node);
	}

	findRelativeFiles(relation: Relation): Promise<TFile[]> {
		switch (relation) {
			case "child":
				return this.impl.getChildren(this.data);
			case "parent":
				return this.impl.getParents(this.data);
		}
	}

	// TODO make private
	setSpecificRelatives(relation: Relation, nodes: Set<HierarchyNode>) {
		this.relatives[relation] = nodes;
	}

	async updateSpecificRelatives(relation: Relation) {
		if (this.status[relation] === "loading") return;
		this.status[relation] = "loading";

		const files = await this.findRelativeFiles(relation);

		const nodes = new Set(
			files.map((data) => this.hierarchy.getNode(data.path)),
		);
		nodes.delete(this); // prevent self-reference
		const updatedNodes = getSetDiff(this.relatives[relation], nodes);

		this.setSpecificRelatives(relation, nodes);

		const relUpdatePromises = [...updatedNodes].map((updatedNode) => {
			return updatedNode.updateSpecificRelatives(
				getOppositeRelation(relation),
			);
		});

		await Promise.all(relUpdatePromises);
		this.status[relation] = "ready";
	}

	async updateRelatives() {
		await Promise.all([
			this.updateSpecificRelatives("child"),
			this.updateSpecificRelatives("parent"),
		]);
	}
}
