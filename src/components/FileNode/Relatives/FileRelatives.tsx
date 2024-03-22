import React from "react";
import { NodeKind } from "../types";
import { FileNode } from "../FileNode";
import { Collapsible } from "src/components-base/Collapsible";
import { usePluginContext } from "src/hooks/context";
import { join } from "src/utils/basic";
import { observer } from "mobx-react-lite";

import css from "./FileRelatives.scss";
import { NodeView } from "src/models/node-view/node-view";

export const FileRelatives = observer(
	({
		node,
		kind,
		hasIndent,
	}: {
		node: NodeView;
		kind: NodeKind;
		hasIndent: boolean;
	}) => {
		const ctx = usePluginContext();

		const relativeNodes = node.relatives[kind];

		const isHighlighted = ctx.highlightPicker.getObservableValue(node.node);

		return (
			<div className={css.root}>
				{hasIndent ? (
					<div
						className={join([
							css.indent,
							isHighlighted && css.highlighted,
						])}
						onMouseEnter={() => ctx.highlightPicker.pick(node.node)}
						onMouseLeave={() => ctx.highlightPicker.pick(null)}
					/>
				) : null}

				<Collapsible
					expanded={node.getExpanded()}
					className={css.container}
				>
					{relativeNodes.map((child) => (
						<FileNode node={child} key={child.id} kind={kind} />
					))}
				</Collapsible>
			</div>
		);
	},
);
