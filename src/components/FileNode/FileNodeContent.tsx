import React, {
	MouseEventHandler,
	useCallback,
	useEffect,
	useState,
} from "react";
import { usePluginContext } from "../../hooks/appContext";
import { TFile } from "obsidian";
import { ObsIcon } from "../../baseComponents/ObsIcon";
import { filesData } from "../../state";
import { checkHasMetaLink } from "../../utils/obsidian";
import { NodeKind } from "./types";

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

	const [highlighted, setHighlighted] = filesData.highlighted.useStore(
		file.path,
	);

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

	const toggleLink: MouseEventHandler<HTMLElement> = useCallback(
		(e) => {
			e.stopPropagation();

			const currentFile = ctx.app.workspace.getActiveFile();

			if (!currentFile || currentFile.path === file.path) return;

			// FIXME: the fact that the function has resolved does not mean that the text has changed
			// Be careful, this may cause the state to be out of sync
			ctx.app.fileManager.processFrontMatter(
				currentFile,
				(frontMatter) => {
					const isLinked = checkHasMetaLink(
						ctx,
						currentFile,
						file.basename,
					);
					const newValue = `[[${file.basename}]]`;
					if (isLinked) {
						const index =
							frontMatter[ctx.settings.parentPropName].indexOf(
								newValue,
							);
						if (index < 0) return;

						frontMatter[ctx.settings.parentPropName].splice(
							index,
							1,
						);
						setLinkIcon("link");
					} else if (frontMatter[ctx.settings.parentPropName]) {
						frontMatter[ctx.settings.parentPropName] ??= [];

						frontMatter[ctx.settings.parentPropName].push(newValue);
						setLinkIcon("unlink");
					}
					ctx.relativeFilesUpdater.addToQueue(file.path);
					ctx.relativeFilesUpdater.addToQueue(currentFile.path);
				},
			);
		},
		[setLinkIcon],
	);

	const isPrev =
		filesData.history.getState().files.at(-2)?.path === file.path;

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
			onMouseEnter={() => setHighlighted(true)}
			onMouseLeave={() => setHighlighted(false)}
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
					<ObsIcon kind={linkIcon} onClick={toggleLink} size="xs" />
				)}
			</div>
		</div>
	);
};
