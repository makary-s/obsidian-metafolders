import { App, TFile } from "obsidian";
import { checkHasPropByPosition, getRelativeFileByName } from "../obsidian";

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
