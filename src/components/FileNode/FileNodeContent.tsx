import React, {
	MouseEventHandler,
	useCallback,
	useEffect,
	useState,
} from "react";
import { usePluginContext } from "../../hooks/appContext";
import { TFile } from "obsidian";
import { ObsIcon } from "../../baseComponents/ObsIcon";
import { checkHasMetaLink } from "../../utils/obsidian";
import { NodeKind } from "./types";
import { toggleLink } from "./helpers";

export const FileNodeContent = ({
	file,
	kind,
	depth,
	expanded,
	hasChildren,
	toggleExpand,
	onClick,
}: {
	file: TFile;
	kind: NodeKind | "root";
	depth: number;
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

	const isLinked = currentFile
		? checkHasMetaLink(ctx, currentFile, file.basename)
		: false;

	const [linkIcon, setLinkIcon] = useState(isLinked ? "unlink" : "link");

	useEffect(() => {
		setLinkIcon(isLinked ? "unlink" : "link");
		// FIXME: intentionally do not subscribe to isLinked,
		// because processFrontMatter works with an untraceable delay
		// which can lead to bugs
	}, [highlighted]);

	const handleToggleLink: MouseEventHandler<HTMLElement> = useCallback(
		(e) => {
			e.stopPropagation();

			const currentFile = ctx.app.workspace.getActiveFile();
			if (!currentFile) return;

			toggleLink(ctx, {
				file: currentFile,
				linkedFile: file,
				onChange: (newIsLinked) => {
					setLinkIcon(newIsLinked ? "unlink" : "link");
				},
			});
		},
		[setLinkIcon, file],
	);

	const isPrev = ctx.history.checkPreviousFile(file);

	return (
		<div
			className={[
				"file-node__container",
				highlighted ? "file-node__container_highlight" : "",
				`file-node__container_kind-${kind}`,
				depth === 0 ? "" : "file-node__container_indented",
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
