import React, { MouseEventHandler, useCallback, useMemo } from "react";
import { usePluginContext } from "../../hooks/context";
import { FileNodeContent } from "./FileNodeContent";
import { FileRelatives } from "./FileRelatives";
import { BreadCrumb } from "src/models/bread-crumbs";
import { updateRootFile } from "src/utils/hierarchy";
import { HierarchyNode } from "src/models/hierarchy/node";

export const RootFileNode = ({ node }: { node: HierarchyNode }) => {
	const ctx = usePluginContext();

	const onClick: MouseEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			const isNewTab =
				e.ctrlKey || e.metaKey ? (e.altKey ? "split" : "tab") : false;

			updateRootFile(ctx, node.data);

			ctx.app.workspace.openLinkText(node.data.path, "", isNewTab, {
				active: true,
			});
		},
		[node],
	);

	const breadCrumps = useMemo(() => BreadCrumb.createRoot(node.id), [node]);

	return (
		<div className="file-node">
			<FileRelatives
				node={node}
				hasIndent={false}
				kind="parent"
				breadCrumps={breadCrumps}
				expanded
				collapsedDepth={0}
			/>

			<FileNodeContent
				hasIndent={false}
				node={node}
				kind={"root"}
				onClick={onClick}
				noArrow
			/>

			<FileRelatives
				node={node}
				hasIndent={false}
				kind="child"
				breadCrumps={breadCrumps}
				expanded
				collapsedDepth={0}
			/>
		</div>
	);
};
