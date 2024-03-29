import React, {
	MouseEventHandler,
	useCallback,
	useEffect,
	useRef,
} from "react";
import { usePluginContext } from "../../hooks/context";
import { FileNodeProps } from "./types";
import { FileNodeContent } from "./FileNodeContent";
import { FileRelatives } from "./FileRelatives";
import { useBreadCrumpChild } from "src/hooks/bread-crumbs";
import { useHierarchyNodeRelatives } from "src/hooks/hierarchy";
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

	const highlightedId = ctx.highlighted.useCurrentFor(node.key);
	const highlighted = highlightedId === node.key;

	const breadCrump = useBreadCrumpChild(parentBreadCrumps, node.key);

	const setHighlighted = useCallback(() => {
		ctx.highlighted.set(node.key);
	}, [node.key]);

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

	const [relativeFilesAsync, updateRelativeFiles] = useHierarchyNodeRelatives(
		node,
		kind,
	);

	useEffect(() => {
		if (collapsedDepth < 1) {
			updateRelativeFiles();
		}
	}, [updateRelativeFiles, collapsedDepth]);

	const hasChildren =
		relativeFilesAsync.status !== "loading" &&
		relativeFilesAsync.data.length !== 0;

	return (
		<div className={`file-node file-node_kind-${kind}`}>
			<FileNodeContent
				file={node.data}
				kind={kind}
				onClick={onClick}
				hasChildren={hasChildren}
				expanded={expanded}
				toggleExpand={toggleExpand}
			/>
			{relativeFilesAsync.status === "ready" ? (
				<FileRelatives
					nodes={relativeFilesAsync.data}
					hasIndent
					highlight={highlighted}
					kind={kind}
					onIndentHover={setHighlighted}
					breadCrumps={breadCrump}
					expanded={expanded}
					collapsedDepth={
						expanded ? collapsedDepth : collapsedDepth + 1
					}
				/>
			) : null}
		</div>
	);
};
