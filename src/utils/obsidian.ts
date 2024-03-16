import { App, LinkCache, TFile } from "obsidian";
import { HEADING_TITLE_PROP_NAME } from "src/constants";
import { PluginContext } from "src/context";

export const getRelativeFileByName = (
	app: App,
	path: string,
	sourcePath: string,
): TFile | undefined => {
	return (
		app.metadataCache.getFirstLinkpathDest(path, sourcePath ?? "") ??
		undefined
	);
};

/**
 * @param path should contain file extension
 */
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
		// Do not use registerEvent because the subscription happens automatically.
		const unsubscribeActiveLeafChange = app.workspace.on(
			"active-leaf-change",
			() => {
				resolve();
				app.workspace.offref(unsubscribeActiveLeafChange);
			},
		);
	});
};

export const getH1Text = (app: App, file: TFile): undefined | string => {
	const cache = app.metadataCache.getFileCache(file);

	const firstHeading = cache?.headings?.[0];

	if (firstHeading && firstHeading.level === 1) {
		return firstHeading.heading;
	}
};

export const getFileName = (ctx: PluginContext, file: TFile): string => {
	const { titlePropNames } = ctx.settings.current;

	if (titlePropNames.length === 0) {
		return file.basename;
	}

	const metadata = ctx.app.metadataCache.getFileCache(file);

	for (const titlePropName of titlePropNames) {
		if (titlePropName === HEADING_TITLE_PROP_NAME) {
			const headingText = getH1Text(ctx.app, file);

			if (headingText) {
				return headingText;
			}
		}

		let title = metadata?.frontmatter?.[titlePropName];

		if (Array.isArray(title)) {
			title = title[0];
		}

		if (title !== undefined && title !== null && title !== "") {
			return String(title);
		}
	}

	return file.basename;
};

export const checkHasPropByPosition = async (p: {
	app: App;
	file: TFile;
	startOffset: number;
	parentPropName: string;
}): Promise<boolean> => {
	const content = await p.app.vault.read(p.file);

	let currentIndex = p.startOffset - 1;
	const lineChars = [] as string[];

	while (currentIndex >= 0) {
		const char = content[currentIndex];
		if (char === undefined || char === "\n") break;
		lineChars.push(char);
		currentIndex -= 1;
	}

	lineChars.reverse();
	const line = lineChars.join("");

	// FIXME false positive matches are possible
	return Boolean(
		line.match(RegExp(`(^\\s*-?\\s*|\\[)${p.parentPropName}::\\s*`)),
	);
};
