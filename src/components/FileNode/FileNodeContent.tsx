import React, {
	MouseEventHandler,
	useCallback,
	useEffect,
	useState,
} from "react";
import { usePluginContext } from "../../hooks/context";
import { TFile } from "obsidian";
import { ObsIcon } from "../../base-components/ObsIcon";
import { NodeKind } from "./types";
import { PluginContext } from "src/context";
import {
	addParentLink,
	checkActiveFileHasParent,
	removeParentLink,
} from "src/utils/hierarchy";
import { getFileName } from "src/utils/obsidian";
import { Clickable } from "src/base-components/Clickable";
import { join } from "src/utils/basic";
import { HierarchyNode } from "src/models/hierarchy/node";
import { observer } from "mobx-react-lite";

const useIsLinked = (ctx: PluginContext, file: TFile) => {
	const currentIsLinked = checkActiveFileHasParent(ctx, file);

	const [oldIsLinked, setIsLinked] = useState(currentIsLinked);

	useEffect(() => {
		setIsLinked(currentIsLinked);
	}, [currentIsLinked]);

	const updateIsLinked = useCallback(() => {
		const newIsLinked = checkActiveFileHasParent(ctx, file);

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

		const currentId = ctx.currentFile.useCurrentFor(node.id);
		const isCurrent = currentId === node.id;

		const expanderIcon =
			node.hasChildren && noArrow === false
				? {
						kind: isCurrent
							? "chevron-right-circle"
							: "chevron-right",
						className: expanded
							? "file-node__expander_expanded"
							: "",
						onClick: toggleExpand,
					}
				: { kind: isCurrent ? "circle-dot" : "dot" };

		const highlightedId = ctx.highlighted.useCurrentFor(node.id);
		const highlighted = highlightedId === node.id;

		const [isLinked, updateIsLinked] = useIsLinked(ctx, node.data);

		const file = node.data;

		const handleToggleLink: MouseEventHandler<HTMLElement> = useCallback(
			async (e) => {
				e.stopPropagation();

				const activeFile = ctx.app.workspace.getActiveFile();
				if (!activeFile) return;

				if (checkActiveFileHasParent(ctx, file)) {
					await removeParentLink(ctx, {
						file: activeFile,
						linkedFile: file,
					});
				} else {
					await addParentLink(ctx, {
						file: activeFile,
						linkedFile: file,
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
					"file-node__container",
					highlighted && "file-node__container_highlight",
					`file-node__container_kind-${kind}`,
					hasIndent && "file-node__container_indented",
				])}
				onClick={onClick}
				onMouseEnter={() => {
					ctx.highlighted.set(node.id);
				}}
				onMouseLeave={() => ctx.highlighted.set(null)}
			>
				<Clickable onClick={expanderIcon.onClick}>
					<ObsIcon
						kind={expanderIcon.kind}
						size="xs"
						className={join([
							"file-node__expander",
							expanderIcon.className,
						])}
					/>
				</Clickable>
				<div className="file-node__content-wrapper">
					<div
						className="file-node__content"
						ref={textElRef}
						title={textElTooltip}
					>
						<span className="file-node__content-text">
							{getFileName(ctx, file)}
						</span>
						{isPrev ? (
							<ObsIcon
								className="file-node__content-last-icon"
								size="xs"
								kind="history"
							/>
						) : null}
					</div>
					{file.parent?.path && file.parent.path !== "/" ? (
						<div className="file-node__path">
							{file.parent.path}
						</div>
					) : null}
				</div>

				<div className="file-node__content-side">
					{!isCurrent && currentId !== null && (
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
