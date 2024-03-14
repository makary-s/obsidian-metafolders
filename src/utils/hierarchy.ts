import { App, TFile } from "obsidian";
import {
	extractMdLinkPath,
	getFileBacklinks,
	getFileByPath,
	getFileName,
	getRelativeFileByName,
} from "./obsidian";
import { PluginContext } from "src/context";
import { createPromise } from "./basic";
import { HierarchyImpl } from "src/models/hierarchy/impl";
import { HierarchyNode } from "src/models/hierarchy/node";

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

export const getParentFiles = async (p: {
	app: App;
	file: TFile;
	parentPropName: string;
}): Promise<TFile[]> => {
	const result: TFile[] = [];

	const metadata = p.app.metadataCache.getFileCache(p.file);

	const frontMatterLinks = metadata?.frontmatterLinks;

	if (frontMatterLinks) {
		for (const item of frontMatterLinks) {
			if (item.key.split(".")[0] === p.parentPropName) {
				const linkedFile = getRelativeFileByName(
					p.app,
					item.link,
					p.file.path,
				);
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
				const linkedFile = getRelativeFileByName(
					p.app,
					item.link,
					p.file.path,
				);
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
					const childFile = getRelativeFileByName(
						p.app,
						childPath,
						p.file.path,
					);
					if (childFile) {
						childFiles.push(childFile);
					}
				}
				// if inline
			} else if ("position" in childLink) {
				const childFile = getRelativeFileByName(
					p.app,
					childPath,
					p.file.path,
				);
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

export const checkHasParent = (
	ctx: PluginContext,
	file: TFile,
	linkFile: TFile,
): boolean => {
	const fullLinkFile = getRelativeFileByName(
		ctx.app,
		linkFile.path,
		file.path,
	)?.path;
	if (!fullLinkFile) return false;

	return ctx.hierarchy
		.getNode(file.path)
		.hasRelativePath("parent", fullLinkFile);
};

export const checkActiveFileHasParent = (
	ctx: PluginContext,
	linkFile: TFile,
) => {
	const currentFile = ctx.app.workspace.getActiveFile();
	if (!currentFile) return false;

	return checkHasParent(ctx, currentFile, linkFile);
};

const getNormalizedFrontmatterArray = (
	frontmatter: any,
	propName: string,
): unknown[] => {
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

	// Do not use registerEvent because the subscription happens automatically below.
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
			ctx.settings.get("parentPropName"),
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
	const links = ctx.app.metadataCache.getFileCache(p.file)?.links ?? [];

	// Deleting inline links
	for (const item of links) {
		if (
			await checkHasPropByPosition({
				app: ctx.app,
				parentPropName: ctx.settings.get("parentPropName"),
				file: p.file,
				startOffset: item.position.start.offset,
			})
		) {
			const content = await ctx.app.vault.read(p.file);
			let endOffset = item.position.end.offset;
			while (endOffset < content.length) {
				endOffset += 1;
				const char = content[endOffset];
				if (
					char === undefined ||
					char === "\n" ||
					!(char === " " || char === ",")
				) {
					break;
				}
			}

			const newContent =
				content.slice(0, item.position.start.offset) +
				content.slice(endOffset);

			// Editor API is not needed here.
			ctx.app.vault.modify(p.file, newContent);
		}
	}

	const finished = createPromise<void>();

	const checkLinked = () => checkHasParent(ctx, p.file, p.linkedFile);

	// Do not use registerEvent because the subscription happens automatically below.
	const eventRef = ctx.app.metadataCache.on("resolved", () => {
		if (!checkLinked()) finished.resolve();
	});

	ctx.app.fileManager.processFrontMatter(p.file, (frontMatter) => {
		if (!checkLinked()) {
			finished.resolve();
			return;
		}

		const prop = getNormalizedFrontmatterArray(
			frontMatter,
			ctx.settings.get("parentPropName"),
		);

		const index = prop.findIndex((item: string) => {
			const path = extractMdLinkPath(item);
			if (!path) return false;

			const fullPath = getRelativeFileByName(
				ctx.app,
				path,
				p.file.path,
			)?.path;
			if (!fullPath) return false;

			return fullPath === p.linkedFile.path;
		});

		if (index !== -1) {
			prop.splice(index, 1);
		}
	});

	await finished;

	ctx.app.metadataCache.offref(eventRef);
};

export const updateRootFile = (
	ctx: PluginContext,
	newFile_?: TFile,
	shouldSaveHistory = true,
) => {
	const rootFilePath = ctx.settings.get("rootFilePath");

	const newFile = newFile_ ?? ctx.app.workspace.getActiveFile();
	if (newFile && newFile.path !== rootFilePath) {
		ctx.settings.set("rootFilePath", newFile.path);

		if (shouldSaveHistory) {
			ctx.history.push(newFile);
		}
	}
};

export const createFileHierarchyImpl = (ctx: PluginContext): HierarchyImpl => ({
	getChildren: async (file) =>
		getChildFiles({
			app: ctx.app,
			file,
			parentPropName: ctx.settings.get("parentPropName"),
		}),
	getParents: async (file) =>
		getParentFiles({
			app: ctx.app,
			file,
			parentPropName: ctx.settings.get("parentPropName"),
		}),
	getDataByKey: (key) => getFileByPath(ctx.app, key),
	getKey: (file) => file.path,
	createNode: (props) => {
		return new HierarchyNode(props);
	},
});

const getSortItemsFn = (
	ctx: PluginContext,
): ((a: HierarchyNode, b: HierarchyNode) => number) => {
	const { sortMode } = ctx.settings.current;

	switch (sortMode.kind) {
		case "title":
			return (a: HierarchyNode, b: HierarchyNode) => {
				const fileNameA = getFileName(ctx, a.data);
				const fileNameB = getFileName(ctx, b.data);
				return sortMode.direction === "asc"
					? fileNameA.localeCompare(fileNameB)
					: fileNameB.localeCompare(fileNameA);
			};
		case "modifiedTime":
			return (a: HierarchyNode, b: HierarchyNode) => {
				return sortMode.direction === "asc"
					? a.data.stat.mtime - b.data.stat.mtime
					: b.data.stat.mtime - a.data.stat.mtime;
			};
		case "createdTime":
			return (a: HierarchyNode, b: HierarchyNode) => {
				return sortMode.direction === "asc"
					? a.data.stat.ctime - b.data.stat.ctime
					: b.data.stat.ctime - a.data.stat.ctime;
			};
		default:
			throw new Error(`Unsupported sort mode: ${sortMode.kind}`);
	}
};

export const sortFiles = (
	ctx: PluginContext,
	files: HierarchyNode[],
): HierarchyNode[] => {
	return files.sort(getSortItemsFn(ctx));
};
