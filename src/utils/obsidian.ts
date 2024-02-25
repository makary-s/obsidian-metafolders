import { App, LinkCache, TFile } from "obsidian";

export const getRelativeFileByPath = (
	app: App,
	path: string,
	sourcePath: string,
): TFile | undefined => {
	return (
		app.metadataCache.getFirstLinkpathDest(path, sourcePath ?? "") ??
		undefined
	);
};

export const getFileByPath = (app: App, path: string): TFile | undefined => {
	const file = app.vault.getAbstractFileByPath(path);

	if (file instanceof TFile) {
		return file;
	}
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

export const waitFilesLoaded = (app: App): Promise<void> => {
	return new Promise<void>((resolve) => {
		const unsubscribeActiveLeafChange = app.workspace.on(
			"active-leaf-change",
			() => {
				resolve();
				app.workspace.offref(unsubscribeActiveLeafChange);
			},
		);
	});
};
