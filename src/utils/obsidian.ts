import { LinkCache, TFile } from "obsidian";
import { PluginContext } from "src/context";

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

// TODO draft
export const checkHasMetaLink = (
	ctx: PluginContext,
	file: TFile,
	linkPath: string,
): boolean => {
	const frontmatter = ctx.app.metadataCache.getFileCache(file)?.frontmatter;

	if (!frontmatter) return false;

	return Boolean(
		frontmatter[ctx.settings.parentPropName]?.includes(`[[${linkPath}]]`),
	);
};
