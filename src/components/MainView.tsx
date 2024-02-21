import React, { useEffect } from "react";
import { usePluginContext } from "../hooks/appContext";
import { useUpdateRootFile } from "src/hooks/useUpdateRootFile";
import { RootFileNode } from "./FileNode/RootFileNode";

export const MainView = () => {
	const ctx = usePluginContext();
	const rootFile = ctx.rootFile.useValue();

	const updateRootFile = useUpdateRootFile();

	useEffect(() => {
		ctx.app.workspace.on("active-leaf-change", (leaf) => {
			if (leaf) {
				const viewState = leaf.getViewState();
				if (viewState.type === "markdown" && ctx.isAutoRefresh.get()) {
					updateRootFile();
				}
			}
		});
		if (rootFile) updateRootFile();
	}, [updateRootFile]);

	if (!rootFile) return null;

	return (
		<div className="mf-root">
			<RootFileNode file={rootFile} key={rootFile.path} />
		</div>
	);
};
