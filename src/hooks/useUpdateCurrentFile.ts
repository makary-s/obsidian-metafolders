import { TFile } from "obsidian";
import { useCallback } from "react";
import { filesData } from "src/state";
import { usePluginContext } from "./appContext";

export const useUpdateCurrentFile = () => {
	const ctx = usePluginContext();

	return useCallback((newFile_?: TFile, shouldSaveHistory = true) => {
		const { value: rootFile } = filesData.rootFile.getState();

		const newFile = newFile_ ?? ctx.app.workspace.getActiveFile();
		if (newFile && newFile.path !== rootFile?.path) {
			filesData.rootFile.setState({ value: newFile });
			if (shouldSaveHistory) {
				filesData.history.setState((s) => {
					const newFiles = s.files
						.slice(0, s.files.length + 1 - s.offset)
						.concat(newFile);
					if (s.files.length > 20) {
						newFiles.shift();
					}
					return {
						offset: 1,
						files: newFiles,
					};
				});
			}
		}
	}, []);
};
