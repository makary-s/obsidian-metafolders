import { App, TFile } from "obsidian";
import { PluginSettings } from "src/types";
import { CurrentChecker } from "./helpers";
import { FilesHistory } from "./history";
import { Hierarchy } from "src/models/hierarchy";
import { createFileHierarchyImpl } from "src/utils/hierarchy";
import { getFileByPath, waitFilesLoaded } from "src/utils/obsidian";
import { AtomCollection, AtomObject } from "src/models/atom";
import HierarchyViewPlugin from "main";

export class PluginContext {
	app: App;
	settings: AtomObject<PluginSettings>;

	currentFile: CurrentChecker;
	highlighted: CurrentChecker;
	history: FilesHistory;
	expanded: AtomCollection<boolean>;
	hierarchy: Hierarchy<TFile>;

	constructor(plugin: HierarchyViewPlugin, settings: PluginSettings) {
		this.app = plugin.app;

		this.settings = new AtomObject(settings);
		this.settings.subscribe(() => plugin.saveData(this.settings.current));

		this.currentFile = new CurrentChecker();

		this.history = new FilesHistory();

		waitFilesLoaded(this.app).then(() => {
			const rootFilePath = this.settings.get("rootFilePath");

			let rootFile = rootFilePath
				? getFileByPath(this.app, rootFilePath)
				: undefined;

			if (!rootFile) {
				// fallback: let's try to use the active file as root

				const currentActiveFile = this.app.workspace.getActiveFile();
				if (currentActiveFile) {
					rootFile = currentActiveFile;
					this.settings.set("rootFilePath", currentActiveFile.path);
				}
			}

			if (rootFile) {
				this.history.push(rootFile);
			} else {
				// fallback: enable auto-update so that the first open file becomes the root file

				this.settings.set("isAutoRefresh", true);
			}
		});

		this.highlighted = new CurrentChecker(null);

		this.expanded = new AtomCollection(false);

		this.hierarchy = Hierarchy.create({
			impl: createFileHierarchyImpl(this),
		});
	}
}
