import React, { useMemo } from "react";
import { NodeKind } from "../types";
import { FileNode } from "../FileNode";
import { Collapsible } from "src/components-base/Collapsible";
import { BreadCrumb } from "src/models/bread-crumbs";
import { HierarchyNode } from "src/models/hierarchy/node";
import { usePluginContext } from "src/hooks/context";
import { sortFiles } from "src/utils/hierarchy";
import { join } from "src/utils/basic";
import { observer } from "mobx-react-lite";

import css from "./FileRelatives.scss";

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
			<div className={css.root}>
				{hasIndent ? (
					<div
						className={join([
							css.indent,
							isHighlighted && css.indentIsHighlighted,
						])}
						onMouseEnter={() => ctx.highlightPicker.pick(node)}
						onMouseLeave={() => ctx.highlightPicker.pick(null)}
					/>
				) : null}

				<Collapsible
					expanded={expanded}
					className={css.relativesContainer}
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
