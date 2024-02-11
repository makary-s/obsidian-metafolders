import React, { MouseEventHandler, useCallback, useRef } from "react";
import { usePluginContext } from "../../hooks/appContext";
import { getChildFiles, getParentFiles } from "../../utils/hierarchyBuilder";
import { TFile } from "obsidian";
import { useMemoAsync } from "../../hooks/useMemoAsync";
import { filesData } from "../../state";
import { useUpdateCurrentFile } from "../../hooks/useUpdateCurrentFile";
import { FileNodeProps } from "./types";
import { FileNodeContent } from "./FileNodeContent";
import { FileRelatives } from "./FileRelatives";

export const FileNode = ({ file, kind, depth }: FileNodeProps) => {
	const ctx = usePluginContext();
	const updateCurrentFile = useUpdateCurrentFile();
	const clickCount = useRef({ count: 0, timestamp: -1 });

	const [highlighted, setHighlighted] = filesData.highlighted.useStore(
		file.path,
	);

	const onClick: MouseEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			const isNewTab =
				e.ctrlKey || e.metaKey ? (e.altKey ? "split" : "tab") : false;

			if (clickCount.current.count === 1) {
				const now = Date.now();
				if (now - clickCount.current.timestamp < 300) {
					clickCount.current.count = 0;
					clickCount.current.timestamp = 0;
					updateCurrentFile(file);
				} else {
					clickCount.current.count = 1;
					clickCount.current.timestamp = now;
				}
			} else {
				clickCount.current.count = 1;
				clickCount.current.timestamp = Date.now();
			}
			ctx.app.workspace.openLinkText(file.path, "", isNewTab, {
				active: true,
			});
		},
		[file],
	);

	const [expanded, setExpanded] = filesData.expanded.useStore(
		`${file.path}::${kind}::${depth}`,
	);

	const toggleExpand: MouseEventHandler<HTMLElement> = useCallback((e) => {
		e.stopPropagation();
		setExpanded((x) => !x);
	}, []);

	const relativeFilesAsync = useMemoAsync<TFile[]>(async () => {
		switch (kind) {
			case "parent":
				return getParentFiles(ctx, file);
			case "child":
				return getChildFiles(ctx, file);
		}
	}, [kind, file, ctx]);

	const hasChildren =
		relativeFilesAsync.status !== "loading" &&
		relativeFilesAsync.data.length !== 0;

	return (
		<div className={`file-node file-node_kind-${kind}`}>
			<FileNodeContent
				depth={depth}
				file={file}
				kind={kind}
				onClick={onClick}
				hasChildren={hasChildren}
				expanded={expanded}
				toggleExpand={toggleExpand}
			/>
			{relativeFilesAsync.status === "ready" ? (
				<FileRelatives
					files={relativeFilesAsync.data}
					hasIndent
					highlight={highlighted}
					kind={kind}
					onIndentHover={setHighlighted}
					depth={depth + 1}
					expanded={expanded}
				/>
			) : null}
		</div>
	);
};
