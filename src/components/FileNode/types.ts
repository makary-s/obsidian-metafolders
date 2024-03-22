import { NodeView } from "src/models/node-view/node-view";

export type NodeKind = "child" | "parent";

export type FileNodeProps = {
	node: NodeView;
	kind: NodeKind;
};
