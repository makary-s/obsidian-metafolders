import { App, TFile } from "obsidian";
import { getFileBacklinks, getFileByPath } from "./obsidian";
import { PluginContext } from "src/context";
import { createPromise } from "./basic";
import { HierarchyImpl } from "src/models/hierarchy/impl";

const checkHasPropByPosition = async (p: {
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
		if (char === "\n") break;
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

export const getParentFiles = async (p: {
	app: App;
	file: TFile;
	parentPropName: string;
}): Promise<TFile[]> => {
	const result = [] as TFile[];

	const metadata = p.app.metadataCache.getFileCache(p.file);

	const frontMatterLinks = metadata?.frontmatterLinks;

	if (frontMatterLinks) {
		for (const item of frontMatterLinks) {
			if (item.key.split(".")[0] === p.parentPropName) {
				const linkedFile = getFileByPath(p.app, item.link);
				if (linkedFile) {
					result.push(linkedFile);
				}
			}
		}
	}

	const links = metadata?.links;

	if (links) {
		for (const item of links) {
			if (
				await checkHasPropByPosition({
					app: p.app,
					parentPropName: p.parentPropName,
					file: p.file,
					startOffset: item.position.start.offset,
				})
			) {
				const linkedFile = getFileByPath(p.app, item.link);
				if (linkedFile) {
					result.push(linkedFile);
				}
			}
		}
	}

	return result;
};

export const getChildFiles = async (p: {
	app: App;
	file: TFile;
	parentPropName: string;
}): Promise<TFile[]> => {
	const childFiles: TFile[] = [];

	const backlinks = getFileBacklinks(p.app, p.file);

	for (const [childPath, childLinks] of Object.entries(backlinks)) {
		for (const childLink of childLinks) {
			// if frontmatter
			if ("key" in childLink && childLink.key) {
				const [childLinkKey] = childLink.key.split(".");

				if (childLinkKey === p.parentPropName) {
					const childFile = getFileByPath(p.app, childPath);
					if (childFile) {
						childFiles.push(childFile);
					}
				}
				// if inline
			} else if ("position" in childLink) {
				const childFile = getFileByPath(p.app, childPath);
				if (
					childFile &&
					(await checkHasPropByPosition({
						app: p.app,
						file: childFile,
						startOffset: childLink.position.start.offset,
						parentPropName: p.parentPropName,
					}))
				) {
					childFiles.push(childFile);
				}
			}
		}
	}

	return childFiles;
};

// TODO draft; does not include inline links
export const checkHasParent = (
	ctx: PluginContext,
	file: TFile,
	linkFile: TFile,
): boolean => {
	const frontmatter = ctx.app.metadataCache.getFileCache(file)?.frontmatter;

	if (!frontmatter) return false;

	const prop = frontmatter[ctx.settings.parentPropName];

	if (Array.isArray(prop)) {
		return prop.includes(`[[${linkFile.basename}]]`);
	} else {
		return prop === `[[${linkFile.basename}]]`;
	}
};

export const checkActiveFileHasParent = (
	ctx: PluginContext,
	linkFile: TFile,
) => {
	const currentFile = ctx.app.workspace.getActiveFile();
	if (!currentFile) return false;

	return checkHasParent(ctx, currentFile, linkFile);
};

const getNormalizedFrontmatterArray = (frontmatter: any, propName: string) => {
	const prop = frontmatter[propName];
	if (prop === undefined || prop === null) {
		frontmatter[propName] = [];
	} else if (Array.isArray(prop) === false) {
		frontmatter[propName] = [prop];
	}

	return frontmatter[propName];
};

export const addParentLink = async (
	ctx: PluginContext,
	p: {
		file: TFile;
		linkedFile: TFile;
	},
): Promise<void> => {
	const finished = createPromise<void>();

	const checkLinked = () => checkHasParent(ctx, p.file, p.linkedFile);

	const eventRef = ctx.app.metadataCache.on("resolved", () => {
		if (checkLinked()) finished.resolve();
	});

	ctx.app.fileManager.processFrontMatter(p.file, (frontMatter) => {
		const newValue = `[[${p.linkedFile.basename}]]`;

		if (checkLinked()) {
			finished.resolve();
			return;
		}

		getNormalizedFrontmatterArray(
			frontMatter,
			ctx.settings.parentPropName,
		).push(newValue);
	});

	await finished;

	ctx.app.metadataCache.offref(eventRef);
};

export const removeParentLink = async (
	ctx: PluginContext,
	p: {
		file: TFile;
		linkedFile: TFile;
	},
): Promise<void> => {
	const finished = createPromise<void>();

	const checkLinked = () => checkHasParent(ctx, p.file, p.linkedFile);

	const eventRef = ctx.app.metadataCache.on("resolved", () => {
		if (!checkLinked()) finished.resolve();
	});

	ctx.app.fileManager.processFrontMatter(p.file, (frontMatter) => {
		const newValue = `[[${p.linkedFile.basename}]]`;

		if (!checkLinked()) {
			finished.resolve();
			return;
		}

		const prop = getNormalizedFrontmatterArray(
			frontMatter,
			ctx.settings.parentPropName,
		);

		const index = prop.indexOf(newValue);
		if (index !== -1) {
			prop.splice(index, 1);
		}

		// ctx.relativeFilesUpdater.addToUpdateQueue(p.file.path);
		// ctx.relativeFilesUpdater.addToUpdateQueue(p.linkedFile.path);
	});

	await finished;

	ctx.app.metadataCache.offref(eventRef);
};

export const updateRootFile = (
	ctx: PluginContext,
	newFile_?: TFile,
	shouldSaveHistory = true,
) => {
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
};

export const createFileHierarchyImpl = (
	ctx: PluginContext,
): HierarchyImpl<TFile> => ({
	getChildren: async (file) =>
		getChildFiles({
			app: ctx.app,
			file,
			parentPropName: ctx.settings.parentPropName,
		}),
	getParents: async (file) =>
		getParentFiles({
			app: ctx.app,
			file,
			parentPropName: ctx.settings.parentPropName,
		}),
	getDataByKey: (key) => getFileByPath(ctx.app, key),
	getKey: (file) => file.path,
});
