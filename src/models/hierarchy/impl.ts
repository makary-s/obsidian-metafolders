import { TFile } from "obsidian";
import { HierarchyNode, HierarchyNodeProps } from "./node";

export type HierarchyImpl = {
	getDataByKey: (key: string) => TFile | undefined;
	getChildren: (data: TFile) => Promise<TFile[]>;
	getParents: (data: TFile) => Promise<TFile[]>;
	getKey: (data: TFile) => string;
	createNode: (props: HierarchyNodeProps) => HierarchyNode;
};
