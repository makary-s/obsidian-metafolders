import React, {
	MouseEventHandler,
	useCallback,
	useEffect,
	useRef,
} from "react";
import { usePluginContext } from "../../hooks/appContext";
import { getChildFiles, getParentFiles } from "../../utils/hierarchyBuilder";
import { TFile } from "obsidian";
import { useMemoAsync } from "../../hooks/useMemoAsync";
import { useUpdateRootFile } from "../../hooks/useUpdateRootFile";
import { FileNodeProps } from "./types";
import { FileNodeContent } from "./FileNodeContent";
import { FileRelatives } from "./FileRelatives";

export const FileNode = ({
	file,
	kind,
	parentBreadCrumps,
	collapsedDepth,
}: FileNodeProps) => {
	const ctx = usePluginContext();
	const updateRootFile = useUpdateRootFile();
	const clickCount = useRef({ count: 0, timestamp: -1 });

	const highlighted = ctx.highlighted.useIsCurrent(file.path);

	const breadCrump = parentBreadCrumps.useChild(file.path);

	const setHighlighted = useCallback(() => {
		ctx.highlighted.set(file.path);
	}, [file.path]);

	const onClick: MouseEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			const isNewTab =
				e.ctrlKey || e.metaKey ? (e.altKey ? "split" : "tab") : false;

			if (clickCount.current.count === 1) {
				const now = Date.now();
				if (now - clickCount.current.timestamp < 300) {
					clickCount.current.count = 0;
					clickCount.current.timestamp = 0;
					updateRootFile(file);
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

	const expandId = `${breadCrump.pathString}:${kind}`;

	const expanded = ctx.expanded.useValue(expandId);

	const toggleExpand: MouseEventHandler<HTMLElement> = useCallback(
		(e) => {
			e.stopPropagation();
			ctx.expanded.setFn(expandId, (x) => !x);
		},
		[expandId],
	);

	const [relativeFilesAsync, updateRelativeFiles] = useMemoAsync<
		TFile[]
	>(async () => {
		switch (kind) {
			case "parent":
				return getParentFiles(ctx, file);
			case "child":
				return getChildFiles(ctx, file);
		}
	}, [kind, file, ctx]);

	useEffect(() => {
		if (collapsedDepth < 1) {
			updateRelativeFiles();
		}
	}, [updateRelativeFiles, collapsedDepth]);

	ctx.relativeFilesUpdater.useSubscribe(file.path, updateRelativeFiles);

	const hasChildren =
		relativeFilesAsync.status !== "loading" &&
		relativeFilesAsync.data.length !== 0;

	return (
		<div className={`file-node file-node_kind-${kind}`}>
			<FileNodeContent
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
					breadCrumps={breadCrump}
					expanded={expanded}
					collapsedDepth={
						expanded ? collapsedDepth : collapsedDepth + 1
					}
				/>
			) : null}
		</div>
	);
};
