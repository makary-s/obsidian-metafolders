import React, { useEffect } from "react";
import { useStore } from "zustand";
import { usePluginContext } from "../hooks/appContext";
import { filesData } from "src/state";
import { useUpdateRootFile } from "src/hooks/useUpdateRootFile";
import { RootFileNode } from "./FileNode/RootFileNode";

export const MainView = () => {
	const ctx = usePluginContext();
	const { value: rootFile } = useStore(filesData.rootFile);

	const updateRootFile = useUpdateRootFile();

	useEffect(() => {
		ctx.app.workspace.on("active-leaf-change", (leaf) => {
			if (leaf) {
				const viewState = leaf.getViewState();
				if (
					viewState.type === "markdown" &&
					filesData.isAutoRefresh.getState()
				) {
					updateRootFile();
				}
			}
		});
		updateRootFile();
	}, [updateRootFile]);

	if (!rootFile) return null;

	return <RootFileNode file={rootFile} key={rootFile.path} />;
};
