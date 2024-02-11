import { TFile } from "obsidian";

export type NodeKind = "child" | "parent";

export type FileNodeProps = {
	file: TFile;
	kind: NodeKind;
	depth: number;
};
