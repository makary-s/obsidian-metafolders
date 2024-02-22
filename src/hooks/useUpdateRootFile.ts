import { TFile } from "obsidian";
import { useCallback } from "react";
import { usePluginContext } from "./appContext";
import { updateRootFile } from "src/utils/hierarchy";

export const useUpdateRootFile = () => {
	const ctx = usePluginContext();

	return useCallback((newFile_?: TFile, shouldSaveHistory = true) => {
		updateRootFile(ctx, newFile_, shouldSaveHistory);
	}, []);
};
