import { TFile } from "obsidian";
import { HierarchyNode, HierarchyNodeProps } from "./node";

export type HierarchyImpl = {
	getFileByPath: (key: string) => TFile | undefined;
	getChildren: (data: TFile) => Promise<TFile[]>;
	getParents: (data: TFile) => Promise<TFile[]>;
	getPath: (data: TFile) => string;
	createNode: (props: HierarchyNodeProps) => HierarchyNode;
};
