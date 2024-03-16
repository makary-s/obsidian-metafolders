import React, {
	MouseEventHandler,
	useCallback,
	useEffect,
	useState,
} from "react";
import { usePluginContext } from "../../../hooks/context";
import { ObsIcon } from "../../../components-base/ObsIcon";
import { NodeKind } from "../types";
import { PluginContext } from "src/context";
import {
	addParentLink,
	checkActiveFileHasParent,
	getActiveFileNode,
	removeParentLink,
} from "src/utils/hierarchy";
import { getFileName } from "src/utils/obsidian";
import { Clickable } from "src/components-base/Clickable";
import { join } from "src/utils/basic";
import { HierarchyNode } from "src/models/hierarchy/node";
import { observer } from "mobx-react-lite";

import css from "./FileNodeContent.scss";

const useIsLinked = (ctx: PluginContext, node: HierarchyNode) => {
	const currentIsLinked = checkActiveFileHasParent(ctx, node);

	const [oldIsLinked, setIsLinked] = useState(currentIsLinked);

	useEffect(() => {
		setIsLinked(currentIsLinked);
	}, [currentIsLinked]);

	const updateIsLinked = useCallback(() => {
		const newIsLinked = checkActiveFileHasParent(ctx, node);

		if (oldIsLinked !== newIsLinked) {
			setIsLinked(newIsLinked);
		}
	}, [setIsLinked]);

	return [currentIsLinked, updateIsLinked] as const;
};

export const FileNodeContent = observer(
	({
		node,
		kind,
		hasIndent = true,
		expanded,
		toggleExpand,
		onClick,
		noArrow = false,
	}: {
		node: HierarchyNode;
		kind: NodeKind | "root";
		hasIndent?: boolean;
		expanded?: boolean;
		toggleExpand?: MouseEventHandler<HTMLElement>;
		onClick: MouseEventHandler<HTMLElement>;
		noArrow?: boolean;
	}) => {
		const ctx = usePluginContext();

		const isHighlighted = ctx.highlightPicker.getObservableValue(node);
		const isActive = ctx.activePicker.getObservableValue(node);
		const hasActive = ctx.activePicker.hasObservableValue();

		const expanderIcon =
			kind !== "root" && node.hasRelatives[kind] && noArrow === false
				? {
						kind: isActive
							? "chevron-right-circle"
							: "chevron-right",
						className: expanded ? css.expanded : "",
						onClick: toggleExpand,
					}
				: { kind: isActive ? "circle-dot" : "dot" };

		const [isLinked, updateIsLinked] = useIsLinked(ctx, node);

		const file = node.data;

		const handleToggleLink: MouseEventHandler<HTMLElement> = useCallback(
			async (e) => {
				e.stopPropagation();

				const activeNode = getActiveFileNode(ctx);
				if (!activeNode) return;

				if (checkActiveFileHasParent(ctx, node)) {
					await removeParentLink(ctx, {
						node: activeNode,
						linkedNode: node,
					});
				} else {
					await addParentLink(ctx, {
						node: activeNode,
						linkedNode: node,
					});
				}

				updateIsLinked();
			},
			[file],
		);

		const isPrev = ctx.history.checkPreviousFile(file);

		const textElRef = React.useRef<HTMLDivElement>(null);

		const textElTooltip =
			textElRef.current &&
			textElRef.current.scrollWidth > textElRef.current.clientWidth
				? file.basename
				: undefined;

		return (
			<div
				className={join([
					css.container,
					isHighlighted && css.highlighted,
					css[`kind_${kind}`],
					hasIndent && css.hasIndent,
				])}
				onClick={onClick}
				onMouseEnter={() => ctx.highlightPicker.pick(node)}
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
						<span className={css.contentText}>
							{getFileName(ctx, file)}
						</span>
						{isPrev ? (
							<ObsIcon
								className={css.contentLastIcon}
								size="xs"
								kind="history"
							/>
						) : null}
					</div>
					{file.parent?.path && file.parent.path !== "/" ? (
						<div className={css.path}>{file.parent.path}</div>
					) : null}
				</div>

				<div className={css.contentSide}>
					{!isActive && hasActive && (
						<Clickable
							onClick={handleToggleLink}
							tooltip={
								isLinked
									? "Unlink active file"
									: "Link active file"
							}
						>
							<ObsIcon
								kind={isLinked ? "unlink" : "link"}
								size="xs"
							/>
						</Clickable>
					)}
				</div>
			</div>
		);
	},
);
