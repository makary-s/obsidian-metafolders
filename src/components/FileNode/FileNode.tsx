import React, { MouseEventHandler, useCallback, useRef } from "react";
import { usePluginContext } from "../../hooks/context";
import { FileNodeProps } from "./types";
import { FileNodeContent } from "./FileNodeContent";
import { FileRelatives } from "./FileRelatives";
import { useBreadCrumpChild } from "src/hooks/bread-crumbs";
import { useAtomCollection } from "src/hooks/atom";
import { updateRootFile } from "src/utils/hierarchy";

export const FileNode = ({
	node,
	kind,
	parentBreadCrump: parentBreadCrumps,
	collapsedDepth,
}: FileNodeProps) => {
	const ctx = usePluginContext();
	const clickCount = useRef({ count: 0, timestamp: -1 });

	const breadCrump = useBreadCrumpChild(parentBreadCrumps, node.id);

	const onClick: MouseEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			const isNewTab =
				e.ctrlKey || e.metaKey ? (e.altKey ? "split" : "tab") : false;

			if (clickCount.current.count === 1) {
				const now = Date.now();
				if (now - clickCount.current.timestamp < 300) {
					clickCount.current.count = 0;
					clickCount.current.timestamp = 0;
					updateRootFile(ctx, node.data);
				} else {
					clickCount.current.count = 1;
					clickCount.current.timestamp = now;
				}
			} else {
				clickCount.current.count = 1;
				clickCount.current.timestamp = Date.now();
			}
			ctx.app.workspace.openLinkText(node.data.path, "", isNewTab, {
				active: true,
			});
		},
		[node],
	);

	const expandId = `${breadCrump.pathString}:${kind}`;

	const expanded = useAtomCollection(ctx.expanded, expandId);

	const toggleExpand: MouseEventHandler<HTMLElement> = useCallback(
		(e) => {
			e.stopPropagation();
			ctx.expanded.setFn(expandId, (x) => !x);
		},
		[expandId],
	);

	return (
		<div className={`file-node file-node_kind-${kind}`}>
			<FileNodeContent
				node={node}
				kind={kind}
				onClick={onClick}
				expanded={expanded}
				toggleExpand={toggleExpand}
			/>
			<FileRelatives
				node={node}
				hasIndent
				kind={kind}
				breadCrumps={breadCrump}
				expanded={expanded}
				collapsedDepth={expanded ? collapsedDepth : collapsedDepth + 1}
			/>
		</div>
	);
};
