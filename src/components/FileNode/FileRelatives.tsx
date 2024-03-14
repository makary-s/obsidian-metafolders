import React, { useMemo } from "react";
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
		hasIndent,
		breadCrumps,
		expanded,
		collapsedDepth,
	}: {
		node: HierarchyNode;
		kind: NodeKind;
		hasIndent: boolean;
		breadCrumps: BreadCrumb;
		expanded: boolean;
		collapsedDepth: number;
	}) => {
		const ctx = usePluginContext();

		const relativeNodes = node.relatives[kind];
		const sortedNodes = useMemo(() => {
			return sortFiles(ctx, [...relativeNodes]);
		}, [relativeNodes]);

		const isHighlighted = ctx.highlightPicker.getObservableValue(node);

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
							isHighlighted && "file-node__indent_highlight",
						])}
						onMouseEnter={() => ctx.highlightPicker.pick(node)}
						onMouseLeave={() => ctx.highlightPicker.pick(null)}
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
