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

export const FileNodeContent = ({
	file,
	kind,
	hasIndent = true,
	expanded,
	hasChildren,
	toggleExpand,
	onClick,
}: {
	file: TFile;
	kind: NodeKind | "root";
	hasIndent?: boolean;
	hasChildren?: boolean;
	expanded?: boolean;
	toggleExpand?: MouseEventHandler<HTMLElement>;
	onClick: MouseEventHandler<HTMLElement>;
}) => {
	const ctx = usePluginContext();

	const isCurrent = ctx.currentFile.useIsCurrent(file.path);

	const expanderIcon = hasChildren
		? {
				kind: isCurrent ? "chevron-right-circle" : "chevron-right",
				className: expanded ? "file-node__expander_expanded" : "",
				onClick: toggleExpand,
			}
		: { kind: isCurrent ? "circle-dot" : "dot" };

	const highlighted = ctx.highlighted.useIsCurrent(file.path);

	const [isLinked, updateIsLinked] = useIsLinked(ctx, file);

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
			className={[
				"file-node__container",
				highlighted ? "file-node__container_highlight" : "",
				`file-node__container_kind-${kind}`,
				hasIndent ? "file-node__container_indented" : "",
			]
				.filter(Boolean)
				.join(" ")}
			onClick={onClick}
			onMouseEnter={() => ctx.highlighted.set(file.path)}
			onMouseLeave={() => ctx.highlighted.set(null)}
		>
			<ObsIcon
				kind={expanderIcon.kind}
				onClick={expanderIcon.onClick}
				size="xs"
				className={[
					"file-node__expander",
					expanderIcon.className ?? "",
				].join(" ")}
			/>
			<div className="file-node__content-wrapper">
				<div
					className="file-node__content"
					ref={textElRef}
					title={textElTooltip}
				>
					{file.basename}
				</div>
				{file.parent?.path && file.parent.path !== "/" ? (
					<div className="file-node__path">{file.parent.path}</div>
				) : null}
			</div>
			{isPrev ? <ObsIcon size="s" disabled kind="history" /> : null}
			<div className="file-node__content-side">
				{!isCurrent && (
					<ObsIcon
						kind={isLinked ? "unlink" : "link"}
						onClick={handleToggleLink}
						size="xs"
						tooltip={
							isLinked ? "Unlink active file" : "Link active file"
						}
					/>
				)}
			</div>
		</div>
	);
};
