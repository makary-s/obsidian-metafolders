import { App, TFile } from "obsidian";
import { PluginSettings } from "src/types";
import { Hierarchy } from "src/models/hierarchy";
import { getFileByPath, waitFilesLoaded } from "src/utils/obsidian";
import { AtomObject } from "src/models/atom";
import HierarchyViewPlugin from "main";
import { SinglePicker } from "src/models/Picker";
import { createFileHierarchyImpl } from "src/utils/hierarchy-impl";
import { HierarchyNode } from "src/models/hierarchy/node";
import { HistoryStore, createFileHistoryStore } from "src/models/history";
import { IdObs } from "src/models/IdObs/idObs";

export class PluginContext {
	app: App;
	plugin: HierarchyViewPlugin;
	settings: AtomObject<PluginSettings>;

	history: HistoryStore<TFile>;
	hierarchy: Hierarchy;
	highlightPicker: SinglePicker<HierarchyNode>;
	activePicker: SinglePicker<HierarchyNode>;

	rootKey = new IdObs();

	constructor(plugin: HierarchyViewPlugin, settings: PluginSettings) {
		this.app = plugin.app;
		this.plugin = plugin;

		this.settings = new AtomObject(settings);
		this.settings.subscribe(() => plugin.saveData(this.settings.current));

		this.history = createFileHistoryStore(this, 30);

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

		this.hierarchy = Hierarchy.create({
			impl: createFileHierarchyImpl(this),
		});

		this.highlightPicker = new SinglePicker();
		this.activePicker = new SinglePicker();
	}
}
