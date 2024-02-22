import { App, TFile } from "obsidian";
import { PluginSettings } from "src/types";
import { CurrentChecker, Value, ValueCollection } from "./helpers";
import { FilesHistory } from "./history";
import { Hierarchy } from "src/models/hierarchy";
import { createFileHierarchyImpl } from "src/utils/hierarchy";
import { getFileByPath } from "src/utils/obsidian";

export class PluginContext {
	app: App;
	settings: PluginSettings;
	// TODO create special class for settings
	saveSettings: () => void;

	currentFile: CurrentChecker;
	rootFile: Value<null | TFile>;
	isAutoRefresh: Value<boolean>;
	highlighted: CurrentChecker;
	history: FilesHistory;
	expanded: ValueCollection<boolean>;
	hierarchy: Hierarchy<TFile>;

	constructor(p: Pick<PluginContext, "app" | "settings" | "saveSettings">) {
		this.app = p.app;
		this.settings = p.settings;
		this.saveSettings = p.saveSettings;

		const activeFile = this.app.workspace.getActiveFile();

		this.currentFile = new CurrentChecker(activeFile?.path);

		this.rootFile = new Value<null | TFile>(
			this.settings.rootFilePath
				? getFileByPath(p.app, this.settings.rootFilePath) ?? null
				: activeFile
					? activeFile
					: null,
		);

		this.isAutoRefresh = new Value<boolean>(this.rootFile ? false : true);

		this.highlighted = new CurrentChecker(null);

		this.history = new FilesHistory();

		this.expanded = new ValueCollection(false);

		this.hierarchy = Hierarchy.create({
			impl: createFileHierarchyImpl(this),
		});
	}
}
