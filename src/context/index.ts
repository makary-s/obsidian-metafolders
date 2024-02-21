import { App, TFile } from "obsidian";
import { PluginSettings } from "src/types";
import { CurrentChecker, Value, ValueCollection } from "./helpers";
import { FilesHistory } from "./history";
import { Hierarchy } from "src/models/hierarchy";
import { createFileHierarchyImpl } from "src/utils/hierarchy";

export class PluginContext {
	app: App;
	settings: PluginSettings;

	currentFile: CurrentChecker;
	rootFile: Value<null | TFile>;
	isAutoRefresh: Value<boolean>;
	highlighted: CurrentChecker;
	history: FilesHistory;
	expanded: ValueCollection<boolean>;
	hierarchy: Hierarchy<TFile>;

	constructor(p: Pick<PluginContext, "app" | "settings">) {
		this.app = p.app;
		this.settings = p.settings;

		this.currentFile = new CurrentChecker(
			this.app.workspace.getActiveFile()?.path,
		);

		this.rootFile = new Value<null | TFile>(null);

		this.isAutoRefresh = new Value<boolean>(false);

		this.highlighted = new CurrentChecker(null);

		this.history = new FilesHistory();

		this.expanded = new ValueCollection(false);

		this.hierarchy = Hierarchy.create({
			impl: createFileHierarchyImpl(this),
		});
	}
}
