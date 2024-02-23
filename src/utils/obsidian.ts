import { App, LinkCache, TFile } from "obsidian";

export const getFileByPath = (
	app: App,
	path: string,
	sourcePath: string | null,
): TFile | undefined => {
	return (
		// TODO: check app.vault.getAbstractFileByPath
		app.metadataCache.getFirstLinkpathDest(path, sourcePath ?? "") ??
		undefined
	);
};

export const getFileBacklinks = (
	app: App,
	file: TFile,
): Record<string, LinkCache[]> => {
	return app.metadataCache.getBacklinksForFile(file).data;
};

export const extractMdLinkPath = (link: string): string | undefined => {
	const contents = link.match(/(\[\[(.*?)\]\])/)?.[2];
	if (!contents) return undefined;

	return contents.split("|")[0];
};
