import React, {
	MouseEventHandler,
	useCallback,
	useEffect,
	useMemo,
} from "react";
import { usePluginContext } from "../../hooks/context";
import { TFile } from "obsidian";
import { FileNodeContent } from "./FileNodeContent";
import { FileRelatives } from "./FileRelatives";
import { BreadCrumb } from "src/models/bread-crumbs";
import { useHierarchyNodeRelatives } from "src/hooks/hierarchy";
import { updateRootFile } from "src/utils/hierarchy";

export const RootFileNode = ({ file }: { file: TFile }) => {
	const ctx = usePluginContext();

	const highlighted = ctx.highlighted.useIsCurrent(file.path);

	const onIndentHover = useCallback(() => {
		ctx.highlighted.set(file.path);
	}, [file.path]);

	const onClick: MouseEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			const isNewTab =
				e.ctrlKey || e.metaKey ? (e.altKey ? "split" : "tab") : false;

			updateRootFile(ctx, file);

			ctx.app.workspace.openLinkText(file.path, "", isNewTab, {
				active: true,
			});
		},
		[file],
	);

	const hierarchyNode = useMemo(() => {
		return ctx.hierarchy.getNode(file.path);
	}, [file.path]);

	const [childFilesAsync, updateChildFilesAsync] = useHierarchyNodeRelatives(
		hierarchyNode,
		"child",
	);

	const [parentFilesAsync, updateParentFilesAsync] =
		useHierarchyNodeRelatives(hierarchyNode, "parent");

	// ctx.relativeFilesUpdater.useSubscribe(file.path, updateParentFilesAsync);
	// ctx.relativeFilesUpdater.useSubscribe(file.path, updateChildFilesAsync);

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
				nodes={parentFilesAsync.data}
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
				nodes={childFilesAsync.data}
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
