import { TFile } from "obsidian";
import { PluginContext } from "src/context";
import { checkHasMetaLink } from "src/utils/obsidian";

/**
 * FIXME: does not guarantee that the text has changed immediately
 */
export const toggleLink = (
	ctx: PluginContext,
	p: {
		file: TFile;
		linkedFile: TFile;
		onChange: (isLinked: boolean) => void;
	},
) => {
	ctx.app.fileManager.processFrontMatter(p.file, (frontMatter) => {
		const isLinked = checkHasMetaLink(ctx, p.file, p.linkedFile.basename);
		const newValue = `[[${p.linkedFile.basename}]]`;

		if (isLinked) {
			const index =
				frontMatter[ctx.settings.parentPropName].indexOf(newValue);
			if (index < 0) return;

			frontMatter[ctx.settings.parentPropName].splice(index, 1);
			p.onChange(false);
		} else if (frontMatter[ctx.settings.parentPropName]) {
			frontMatter[ctx.settings.parentPropName] ??= [];

			frontMatter[ctx.settings.parentPropName].push(newValue);
			p.onChange(true);
		}

		ctx.relativeFilesUpdater.addToQueue(p.file.path);
		ctx.relativeFilesUpdater.addToQueue(p.linkedFile.path);
	});
};
