import React, { useEffect } from "react";
import { useStore } from "zustand";
import { usePluginContext } from "../hooks/appContext";
import { filesData } from "src/state";
import { useUpdateCurrentFile } from "src/hooks/useUpdateCurrentFile";
import { RootFileNode } from "./FileNode/RootFileNode";

export const MainView = () => {
	const ctx = usePluginContext();
	const { value: rootFile } = useStore(filesData.rootFile);

	const updateCurrentFile = useUpdateCurrentFile();

	useEffect(() => {
		ctx.app.workspace.on("active-leaf-change", (leaf) => {
			if (leaf) {
				const viewState = leaf.getViewState();
				if (
					viewState.type === "markdown" &&
					filesData.isAutoRefresh.getState()
				) {
					updateCurrentFile();
				}
			}
		});
		updateCurrentFile();
	}, [updateCurrentFile]);

	if (!rootFile) return null;

	return <RootFileNode file={rootFile} key={rootFile.path} />;
};
