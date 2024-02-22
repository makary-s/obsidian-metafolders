import { App, TFile } from "obsidian";
import { PluginSettings } from "src/types";
import { CurrentChecker } from "./helpers";
import { FilesHistory } from "./history";
import { Hierarchy } from "src/models/hierarchy";
import { createFileHierarchyImpl } from "src/utils/hierarchy";
import { getFileByPath } from "src/utils/obsidian";
import { Atom, AtomCollection } from "src/models/atom";

export class PluginContext {
	app: App;
	settings: PluginSettings;
	// TODO create special class for settings
	saveSettings: () => void;

	currentFile: CurrentChecker;
	rootFile: Atom<null | TFile>;
	isAutoRefresh: Atom<boolean>;
	highlighted: CurrentChecker;
	history: FilesHistory;
	expanded: AtomCollection<boolean>;
	hierarchy: Hierarchy<TFile>;

	constructor(p: Pick<PluginContext, "app" | "settings" | "saveSettings">) {
		this.app = p.app;
		this.settings = p.settings;
		this.saveSettings = p.saveSettings;

		const activeFile = this.app.workspace.getActiveFile();

		this.currentFile = new CurrentChecker(activeFile?.path);

		this.rootFile = new Atom<null | TFile>(
			this.settings.rootFilePath
				? getFileByPath(p.app, this.settings.rootFilePath) ?? null
				: activeFile
					? activeFile
					: null,
		);

		this.isAutoRefresh = new Atom<boolean>(this.rootFile ? false : true);

		this.highlighted = new CurrentChecker(null);

		this.history = new FilesHistory();

		this.expanded = new AtomCollection(false);

		this.hierarchy = Hierarchy.create({
			impl: createFileHierarchyImpl(this),
		});
	}
}
