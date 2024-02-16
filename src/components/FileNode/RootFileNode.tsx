import React, { MouseEventHandler, useCallback } from "react";
import { usePluginContext } from "../../hooks/appContext";
import { getChildFiles, getParentFiles } from "../../utils/hierarchyBuilder";
import { TFile } from "obsidian";
import { useMemoAsync } from "../../hooks/useMemoAsync";
import { filesData } from "../../state";
import { useUpdateRootFile } from "../../hooks/useUpdateRootFile";
import { FileNodeContent } from "./FileNodeContent";
import { FileRelatives } from "./FileRelatives";

export const RootFileNode = ({ file }: { file: TFile }) => {
	const ctx = usePluginContext();
	const updateRootFile = useUpdateRootFile();

	const [highlighted, setHighlighted] = filesData.highlighted.useStore(
		file.path,
	);

	const onClick: MouseEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			const isNewTab =
				e.ctrlKey || e.metaKey ? (e.altKey ? "split" : "tab") : false;

			updateRootFile(file);

			ctx.app.workspace.openLinkText(file.path, "", isNewTab, {
				active: true,
			});
		},
		[file],
	);

	const [parentFilesAsync] = useMemoAsync<TFile[]>(async () => {
		return getParentFiles(ctx, file);
	}, [file, ctx]);

	const [childFilesAsync, updateChildFilesAsync] = useMemoAsync<
		TFile[]
	>(async () => {
		return getChildFiles(ctx, file);
	}, [file, ctx]);

	ctx.relativeFilesUpdater.useSubscribe(file.path, updateChildFilesAsync);

	if (
		parentFilesAsync.status === "loading" ||
		childFilesAsync.status === "loading"
	) {
		return null;
	}

	return (
		<div className="file-node">
			<FileRelatives
				files={parentFilesAsync.data}
				hasIndent={false}
				highlight={highlighted}
				kind="parent"
				onIndentHover={setHighlighted}
				depth={0}
				expanded
			/>

			<FileNodeContent
				depth={0}
				file={file}
				kind={"root"}
				onClick={onClick}
			/>

			<FileRelatives
				files={childFilesAsync.data}
				hasIndent={false}
				highlight={highlighted}
				kind="child"
				onIndentHover={setHighlighted}
				depth={0}
				expanded
			/>
		</div>
	);
};
