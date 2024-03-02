import React, { useCallback, useMemo } from "react";
import { NodeKind } from "./types";
import { FileNode } from "./FileNode";
import { Collapsible } from "src/base-components/Collapsible";
import { BreadCrumb } from "src/models/bread-crumbs";
import { HierarchyNode } from "src/models/hierarchy/node";
import { TFile } from "obsidian";
import { usePluginContext } from "src/hooks/context";
import { sortFiles } from "src/utils/hierarchy";

export const FileRelatives = ({
	nodes,
	kind,
	onIndentHover,
	highlight,
	hasIndent,
	breadCrumps,
	expanded,
	collapsedDepth,
}: {
	nodes: HierarchyNode<TFile>[];
	kind: NodeKind;
	onIndentHover?: (hovered: boolean) => void;
	highlight: boolean;
	hasIndent: boolean;
	breadCrumps: BreadCrumb;
	expanded: boolean;
	collapsedDepth: number;
}) => {
	const ctx = usePluginContext();

	const onMouseEnter = useCallback(() => {
		onIndentHover?.(true);
	}, [onIndentHover]);

	const onMouseLeave = useCallback(() => {
		onIndentHover?.(false);
	}, [onIndentHover]);

	const sortedNodes = useMemo(() => {
		return sortFiles(ctx, nodes);
	}, [nodes]);

	return (
		<div
			className={[
				"file-node__relatives",
				expanded ? "" : "file-node__relatives_hidden",
			].join(" ")}
		>
			{hasIndent ? (
				<div
					className={
						"file-node__indent " +
						(highlight ? "file-node__indent_highlight" : "")
					}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
				/>
			) : null}

			<Collapsible
				expanded={expanded}
				className="file-node__relatives-container"
			>
				{sortedNodes.map((child) => (
					<FileNode
						node={child}
						key={child.data.path}
						kind={kind}
						parentBreadCrump={breadCrumps}
						collapsedDepth={collapsedDepth}
					/>
				))}
			</Collapsible>
		</div>
	);
};
