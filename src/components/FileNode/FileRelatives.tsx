import React, { useCallback } from "react";
import { NodeKind } from "./types";
import { FileNode } from "./FileNode";
import { Collapsible } from "src/baseComponents/Collapsible";
import { BreadCrumb } from "src/models/bread-crumbs";
import { HierarchyNode } from "src/models/hierarchy/node";
import { TFile } from "obsidian";

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
	const onMouseEnter = useCallback(() => {
		onIndentHover?.(true);
	}, [onIndentHover]);

	const onMouseLeave = useCallback(() => {
		onIndentHover?.(false);
	}, [onIndentHover]);

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
				{nodes.map((child) => (
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
