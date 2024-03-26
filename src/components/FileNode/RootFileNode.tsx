import React from "react";
import { FileNodeContent } from "./Content/FileNodeContent";
import { FileRelatives } from "./Relatives/FileRelatives";
import { NodeView } from "src/models/node-view/node-view";

export const RootFileNode = ({ node }: { node: NodeView }) => {
	return (
		<div className="file-node">
			<FileRelatives node={node} hasIndent={false} kind="parent" />

			<FileNodeContent
				hasIndent={false}
				node={node}
				kind={"root"}
				noArrow
			/>

			<FileRelatives node={node} hasIndent={false} kind="child" />
		</div>
	);
};
