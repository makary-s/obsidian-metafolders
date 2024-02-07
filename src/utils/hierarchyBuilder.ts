import { TFile } from "obsidian";
import { PluginContext } from "../types";
import { getFileBacklinks, getFileByPath } from "./obsidian";

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
