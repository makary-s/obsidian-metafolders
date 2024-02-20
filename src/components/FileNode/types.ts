import { TFile } from "obsidian";
import { BreadCrumb } from "src/models/bread-crumbs";
import { HierarchyNode } from "src/models/hierarchy/node";

export type NodeKind = "child" | "parent";

export type FileNodeProps = {
	node: HierarchyNode<TFile>;
	kind: NodeKind;
	parentBreadCrump: BreadCrumb;
	collapsedDepth: number;
};
