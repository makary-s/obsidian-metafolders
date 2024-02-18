import React, {
	MouseEventHandler,
	useCallback,
	useEffect,
	useMemo,
} from "react";
import { usePluginContext } from "../../hooks/appContext";
import { getChildFiles, getParentFiles } from "../../utils/hierarchyBuilder";
import { TFile } from "obsidian";
import { useMemoAsync } from "../../hooks/useMemoAsync";
import { useUpdateRootFile } from "../../hooks/useUpdateRootFile";
import { FileNodeContent } from "./FileNodeContent";
import { FileRelatives } from "./FileRelatives";
import { BreadCrumb } from "src/utils/bread-crumbs";

export const RootFileNode = ({ file }: { file: TFile }) => {
	const ctx = usePluginContext();
	const updateRootFile = useUpdateRootFile();

	const highlighted = ctx.highlighted.useIsCurrent(file.path);

	const onIndentHover = useCallback(() => {
		ctx.highlighted.set(file.path);
	}, [file.path]);

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

	const [parentFilesAsync, updateParentFilesAsync] = useMemoAsync<
		TFile[]
	>(async () => {
		return getParentFiles(ctx, file);
	}, [file, ctx]);

	const [childFilesAsync, updateChildFilesAsync] = useMemoAsync<
		TFile[]
	>(async () => {
		return getChildFiles(ctx, file);
	}, [file, ctx]);

	ctx.relativeFilesUpdater.useSubscribe(file.path, updateParentFilesAsync);
	ctx.relativeFilesUpdater.useSubscribe(file.path, updateChildFilesAsync);

	useEffect(() => {
		updateParentFilesAsync();
		updateChildFilesAsync();
	}, [updateParentFilesAsync, updateChildFilesAsync]);

	const breadCrumps = useMemo(
		() => BreadCrumb.createRoot(file.path),
		[file.path],
	);

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
				onIndentHover={onIndentHover}
				breadCrumps={breadCrumps}
				expanded
				collapsedDepth={0}
			/>

			<FileNodeContent
				hasIndent={false}
				file={file}
				kind={"root"}
				onClick={onClick}
			/>

			<FileRelatives
				files={childFilesAsync.data}
				hasIndent={false}
				highlight={highlighted}
				kind="child"
				onIndentHover={onIndentHover}
				breadCrumps={breadCrumps}
				expanded
				collapsedDepth={0}
			/>
		</div>
	);
};
