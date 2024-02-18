import { TFile } from "obsidian";
import { BreadCrumb } from "src/utils/bread-crumbs";

export type NodeKind = "child" | "parent";

export type FileNodeProps = {
	file: TFile;
	kind: NodeKind;
	parentBreadCrumps: BreadCrumb;
	collapsedDepth: number;
};
