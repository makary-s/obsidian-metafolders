import { TFile } from "obsidian";
import {
	checkHasPropByPosition,
	createFullLink,
	extractMdLinkPath,
	getRelativeFileByName,
} from "./obsidian";
import { PluginContext } from "src/context";
import { createPromise } from "./basic";
import { HierarchyNode } from "src/models/hierarchy/node";

export const getActiveFileNode = (ctx: PluginContext): HierarchyNode | null => {
	const currentFile = ctx.app.workspace.getActiveFile();
	if (currentFile === null) return null;

	return ctx.hierarchy.getNode(currentFile.path);
};

export const checkActiveFileHasParent = (
	ctx: PluginContext,
	node: HierarchyNode,
): boolean => {
	const activeNode = getActiveFileNode(ctx);
	if (!activeNode) return false;

	return activeNode.hasRelative("parent", node);
};

const getNormalizedFrontmatterArray = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
		node: HierarchyNode;
		linkedNode: HierarchyNode;
	},
): Promise<void> => {
	const finished = createPromise<void>();

	const checkLinked = () => p.node.hasRelative("parent", p.linkedNode);

	// Do not use registerEvent because the subscription happens automatically below.
	const eventRef = ctx.app.metadataCache.on("resolved", () => {
		if (checkLinked()) finished.resolve();
	});

	ctx.app.fileManager.processFrontMatter(p.node.data, (frontMatter) => {
		if (checkLinked()) {
			finished.resolve();
			return;
		}

		getNormalizedFrontmatterArray(
			frontMatter,
			ctx.settings.get("parentPropName"),
		).push(createFullLink(ctx, p.linkedNode.data));
	});

	await finished;

	ctx.app.metadataCache.offref(eventRef);
};

export const removeParentLink = async (
	ctx: PluginContext,
	p: {
		node: HierarchyNode;
		linkedNode: HierarchyNode;
	},
): Promise<void> => {
	const links = ctx.app.metadataCache.getFileCache(p.node.data)?.links ?? [];

	// Deleting inline links
	for (const item of links) {
		if (
			await checkHasPropByPosition({
				app: ctx.app,
				parentPropName: ctx.settings.get("parentPropName"),
				file: p.node.data,
				startOffset: item.position.start.offset,
			})
		) {
			const content = await ctx.app.vault.read(p.node.data);
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
			ctx.app.vault.modify(p.node.data, newContent);
		}
	}

	const finished = createPromise<void>();

	const checkLinked = () => p.node.hasRelative("parent", p.linkedNode);

	// Do not use registerEvent because the subscription happens automatically below.
	const eventRef = ctx.app.metadataCache.on("resolved", () => {
		if (!checkLinked()) finished.resolve();
	});

	ctx.app.fileManager.processFrontMatter(p.node.data, (frontMatter) => {
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
				p.node.data.path,
			)?.path;
			if (!fullPath) return false;

			return fullPath === p.linkedNode.data.path;
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
