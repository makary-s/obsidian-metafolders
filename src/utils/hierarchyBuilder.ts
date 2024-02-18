import { TFile } from "obsidian";
import { getFileBacklinks, getFileByPath } from "./obsidian";
import { PluginContext } from "src/context";
import { createPromise } from "./basic";

const checkHasPropByPosition = async (
	ctx: PluginContext,
	file: TFile,
	startOffset: number,
): Promise<boolean> => {
	const content = await ctx.app.vault.read(file);

	let currentIndex = startOffset - 1;
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
		line.match(
			RegExp(`(^\\s*-?\\s*|\\[)${ctx.settings.parentPropName}::\\s*`),
		),
	);
};

export const getParentFiles = async (
	ctx: PluginContext,
	file: TFile,
): Promise<TFile[]> => {
	const result = [] as TFile[];

	const metadata = ctx.app.metadataCache.getFileCache(file);

	const frontMatterLinks = metadata?.frontmatterLinks;

	if (frontMatterLinks) {
		for (const item of frontMatterLinks) {
			if (item.key.split(".")[0] === ctx.settings.parentPropName) {
				const linkedFile = getFileByPath(ctx, item.link);
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
				await checkHasPropByPosition(
					ctx,
					file,
					item.position.start.offset,
				)
			) {
				const linkedFile = getFileByPath(ctx, item.link);
				if (linkedFile) {
					result.push(linkedFile);
				}
			}
		}
	}

	return result;
};

export const getChildFiles = async (
	ctx: PluginContext,
	file: TFile,
): Promise<TFile[]> => {
	const childFiles: TFile[] = [];

	const backlinks = getFileBacklinks(ctx, file);

	for (const [childPath, childLinks] of Object.entries(backlinks)) {
		for (const childLink of childLinks) {
			// if frontmatter
			if ("key" in childLink && childLink.key) {
				const [childLinkKey] = childLink.key.split(".");

				if (childLinkKey === ctx.settings.parentPropName) {
					const childFile = getFileByPath(ctx, childPath);
					if (childFile) {
						childFiles.push(childFile);
					}
				}
				// if inline
			} else if ("position" in childLink) {
				const childFile = getFileByPath(ctx, childPath);
				if (
					childFile &&
					(await checkHasPropByPosition(
						ctx,
						childFile,
						childLink.position.start.offset,
					))
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

		ctx.relativeFilesUpdater.addToUpdateQueue(p.file.path);
		ctx.relativeFilesUpdater.addToUpdateQueue(p.linkedFile.path);
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

		ctx.relativeFilesUpdater.addToUpdateQueue(p.file.path);
		ctx.relativeFilesUpdater.addToUpdateQueue(p.linkedFile.path);
	});

	await finished;

	ctx.app.metadataCache.offref(eventRef);
};
