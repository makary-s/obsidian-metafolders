import { TFile } from "obsidian";
import { useCallback } from "react";
import { usePluginContext } from "./appContext";

export const useUpdateRootFile = () => {
	const ctx = usePluginContext();

	return useCallback((newFile_?: TFile, shouldSaveHistory = true) => {
		const rootFile = ctx.rootFile.get();

		const newFile = newFile_ ?? ctx.app.workspace.getActiveFile();
		if (newFile && newFile.path !== rootFile?.path) {
			ctx.rootFile.set(newFile);

			ctx.settings.rootFilePath = newFile.path;
			ctx.saveSettings();

			if (shouldSaveHistory) {
				ctx.history.push(newFile);
			}
		}
	}, []);
};
