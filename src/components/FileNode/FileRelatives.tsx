import React, { useCallback, useMemo } from "react";
import { NodeKind } from "./types";
import { FileNode } from "./FileNode";
import { Collapsible } from "src/base-components/Collapsible";
import { BreadCrumb } from "src/models/bread-crumbs";
import { HierarchyNode } from "src/models/hierarchy/node";
import { usePluginContext } from "src/hooks/context";
import { sortFiles } from "src/utils/hierarchy";
import { join } from "src/utils/basic";
import { observer } from "mobx-react-lite";

export const FileRelatives = observer(
	({
		node,
		kind,
		onIndentHover,
		highlight,
		hasIndent,
		breadCrumps,
		expanded,
		collapsedDepth,
	}: {
		node: HierarchyNode;
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

		const relativeNodes = node.relatives[kind];
		const sortedNodes = useMemo(() => {
			return sortFiles(ctx, [...relativeNodes]);
		}, [relativeNodes]);

		return (
			<div
				className={join([
					"file-node__relatives",
					expanded && "file-node__relatives_hidden",
				])}
			>
				{hasIndent ? (
					<div
						className={join([
							"file-node__indent ",
							highlight && "file-node__indent_highlight",
						])}
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
							key={child.id}
							kind={kind}
							parentBreadCrump={breadCrumps}
							collapsedDepth={collapsedDepth}
						/>
					))}
				</Collapsible>
			</div>
		);
	},
);
