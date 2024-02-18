import React, {
	MouseEventHandler,
	useCallback,
	useEffect,
	useState,
} from "react";
import { usePluginContext } from "../../hooks/appContext";
import { TFile } from "obsidian";
import { ObsIcon } from "../../baseComponents/ObsIcon";
import { NodeKind } from "./types";
import {
	addParentLink,
	checkHasParent,
	removeParentLink,
} from "src/utils/hierarchyBuilder";

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

	const currentFile = ctx.app.workspace.getActiveFile();

	const isCurrent = ctx.currentFile.useIsCurrent(file.path);

	const expanderIcon = hasChildren
		? {
				kind: isCurrent ? "chevron-right-circle" : "chevron-right",
				className: expanded ? "file-node__expander_expanded" : "",
				onClick: toggleExpand,
			}
		: { kind: isCurrent ? "circle-dot" : "dot" };

	const highlighted = ctx.highlighted.useIsCurrent(file.path);

	const [isLinked, setLinked] = useState(
		currentFile ? checkHasParent(ctx, currentFile, file.basename) : false,
	);

	const [linkIcon, setLinkIcon] = useState(isLinked ? "unlink" : "link");

	useEffect(() => {
		setLinkIcon(isLinked ? "unlink" : "link");
	}, [highlighted, isLinked]);

	const handleToggleLink: MouseEventHandler<HTMLElement> = useCallback(
		async (e) => {
			e.stopPropagation();

			const currentFile = ctx.app.workspace.getActiveFile();
			if (!currentFile) return;

			if (isLinked) {
				setLinked(false);
				await removeParentLink(ctx, {
					file: currentFile,
					linkedFile: file,
				});
			} else {
				setLinked(true);
				await addParentLink(ctx, {
					file: currentFile,
					linkedFile: file,
				});
			}

			setLinked(checkHasParent(ctx, currentFile, file.basename));
		},
		[file, isLinked],
	);

	const isPrev = ctx.history.checkPreviousFile(file);

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

			<div className="file-node__content">{file.basename}</div>
			{isPrev ? <ObsIcon size="s" disabled kind="history" /> : null}
			<div className="file-node__content-side">
				{!isCurrent && (
					<ObsIcon
						kind={linkIcon}
						onClick={handleToggleLink}
						size="xs"
					/>
				)}
			</div>
		</div>
	);
};
