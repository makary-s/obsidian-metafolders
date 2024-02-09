import { LinkCache, TFile } from "obsidian";
import { PluginContext } from "../types";
import { SMarkdownPage } from "obsidian-dataview";

export const getFileByPath = (
	ctx: PluginContext,
	path: string,
	sourcePath = "",
) => {
	return ctx.app.metadataCache.getFirstLinkpathDest(path, sourcePath);
};

export const getFileBacklinks = (
	ctx: PluginContext,
	file: TFile,
): Record<string, LinkCache[]> => {
	return ctx.app.metadataCache.getBacklinksForFile(file).data;
};

export const getFileBacklinksDV = (
	ctx: PluginContext,
	file: TFile,
): TFile[] => {
	const page = ctx.dv.page(file.path) as SMarkdownPage;
	const inlinks = page.file.inlinks;

	const result: TFile[] = [];

	for (const link of inlinks) {
		const file = getFileByPath(ctx, link.path);
		if (file) {
			result.push(file);
		}
	}

	return result;
};

// TODO draft
export const checkHasMetaLink = (
	ctx: PluginContext,
	file: TFile,
	linkPath: string,
) => {
	const frontmatter = ctx.app.metadataCache.getFileCache(file)?.frontmatter;

	if (!frontmatter) return false;

	return Boolean(
		frontmatter[ctx.settings.parentPropName]?.includes(`[[${linkPath}]]`),
	);
};
