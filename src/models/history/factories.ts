import { TFile } from "obsidian";
import { PluginContext } from "src/context";
import { updateRootFile } from "src/utils/hierarchy";
import { HistoryStore } from "./history";

export const createFileHistoryStore = (
	ctx: PluginContext,
	maxSize: number,
): HistoryStore<TFile> => {
	return new HistoryStore({
		maxSize,
		checkExists: (file: TFile) =>
			ctx.app.vault.getAbstractFileByPath(file.path) !== null,
		onChange: (file: TFile) => {
			updateRootFile(ctx, file, false);
		},
	});
};
