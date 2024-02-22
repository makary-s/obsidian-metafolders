import { App, TFile } from "obsidian";
import { PluginSettings } from "src/types";
import { CurrentChecker } from "./helpers";
import { FilesHistory } from "./history";
import { Hierarchy } from "src/models/hierarchy";
import { createFileHierarchyImpl } from "src/utils/hierarchy";
import { getFileByPath } from "src/utils/obsidian";
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

		const activeFile = this.app.workspace.getActiveFile();

		this.currentFile = new CurrentChecker(activeFile?.path);

		// TODO: find a suitable event instead of a timeout
		setTimeout(() => {
			const rootFilePath = this.settings.get("rootFilePath");
			const rootFile = rootFilePath
				? getFileByPath(this.app, rootFilePath)
				: null;

			const currentActiveFile = this.app.workspace.getActiveFile();

			if (!rootFile) {
				if (currentActiveFile) {
					this.settings.set("rootFilePath", currentActiveFile.path);
				} else {
					this.settings.set("isAutoRefresh", true);
				}
			}
		}, 1000);

		this.highlighted = new CurrentChecker(null);

		this.history = new FilesHistory();

		this.expanded = new AtomCollection(false);

		this.hierarchy = Hierarchy.create({
			impl: createFileHierarchyImpl(this),
		});
	}
}
