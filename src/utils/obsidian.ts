import { App, LinkCache, TFile } from "obsidian";

export const getFileByPath = (
	app: App,
	path: string,
	sourcePath = "",
): TFile | undefined => {
	return (
		app.metadataCache.getFirstLinkpathDest(path, sourcePath) ?? undefined
	);
};

export const getFileBacklinks = (
	app: App,
	file: TFile,
): Record<string, LinkCache[]> => {
	return app.metadataCache.getBacklinksForFile(file).data;
};
