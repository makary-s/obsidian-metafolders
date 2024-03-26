import { PluginContext } from "src/context";
import { HierarchyNode } from "../hierarchy/node";
import { TFile } from "obsidian";
import { getH1Text } from "src/utils/obsidian";
import { HEADING_TITLE_PROP_NAME } from "src/constants";
import { SortMode } from "src/types";

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

const getSortNodesFn = (
	ctx: PluginContext,
	sortMode: SortMode,
): ((a: HierarchyNode, b: HierarchyNode) => number) => {
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

export const sortNodes = (
	ctx: PluginContext,
	nodes: Set<HierarchyNode>,
	sortMode: SortMode,
): HierarchyNode[] => {
	return [...nodes].sort(getSortNodesFn(ctx, sortMode));
};
