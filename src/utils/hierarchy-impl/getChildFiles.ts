import { App, TFile } from "obsidian";
import {
	checkHasPropByPosition,
	getFileBacklinks,
	getRelativeFileByName,
} from "../obsidian";

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
