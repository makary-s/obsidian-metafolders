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
