import React from "react";
import { usePluginContext } from "../../../hooks/plugin-context";
import { ObsIcon } from "../../../components-base/ObsIcon";
import { NodeKind } from "../types";

import { Clickable } from "src/components-base/Clickable";
import { join } from "src/utils/basic";
import { observer } from "mobx-react-lite";

import css from "./FileNodeContent.scss";
import { NodeView } from "src/models/node-view/node-view";

export const FileNodeContent = observer(
	({
		node,
		kind,
		hasIndent = true,
		noArrow = false,
	}: {
		node: NodeView;
		kind: NodeKind | "root";
		hasIndent?: boolean;
		noArrow?: boolean;
	}) => {
		const ctx = usePluginContext();

		const isHighlighted = ctx.highlightPicker.getObservableValue(node.node);
		const isActive = ctx.activePicker.getObservableValue(node.node);
		const hasActive = ctx.activePicker.getCurrent() !== undefined;

		const expanderIcon =
			kind !== "root" && node.hasRelatives[kind] && noArrow === false
				? {
						kind: isActive
							? "chevron-right-circle"
							: "chevron-right",
						className: node.getExpanded() ? css.expanded : "",
						onClick: node.toggleExpanded,
					}
				: { kind: isActive ? "circle-dot" : "dot" };

		const textElRef = React.useRef<HTMLDivElement>(null);

		const textElTooltip =
			textElRef.current &&
			textElRef.current.scrollWidth > textElRef.current.clientWidth
				? node.title
				: undefined;

		return (
			<div
				className={join([
					css.container,
					isHighlighted && css.highlighted,
					css[`kind_${kind}`],
					hasIndent && css.hasIndent,
				])}
				onClick={node.onClick}
				onMouseEnter={() => ctx.highlightPicker.pick(node.node)}
				onMouseLeave={() => ctx.highlightPicker.pick(null)}
			>
				<Clickable onClick={expanderIcon.onClick}>
					<ObsIcon
						kind={expanderIcon.kind}
						size="xs"
						className={join([css.expander, expanderIcon.className])}
					/>
				</Clickable>
				<div className={css.contentWrapper}>
					<div
						className={css.content}
						ref={textElRef}
						title={textElTooltip}
					>
						<span className={css.contentText}>{node.title}</span>
						{node.isPerviousHistoryItem && (
							<ObsIcon
								className={css.contentLastIcon}
								size="xs"
								kind="history"
							/>
						)}
					</div>
					{node.folderName && (
						<div className={css.path}>{node.folderName}</div>
					)}
				</div>

				<div className={css.contentSide}>
					{!isActive && hasActive && (
						<Clickable
							onClick={node.toggleActiveNodeParent}
							tooltip={
								node.getIsActiveNodeParent()
									? "Unlink active file"
									: "Link active file"
							}
						>
							<ObsIcon
								kind={
									node.getIsActiveNodeParent()
										? "unlink"
										: "link"
								}
								size="xs"
							/>
						</Clickable>
					)}
				</div>
			</div>
		);
	},
);
