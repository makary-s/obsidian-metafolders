import { App, TFile } from "obsidian";
import { PluginSettings } from "src/types";
import { CurrentChecker, Updater, Value, ValueCollection } from "./helpers";
import { FilesHistory } from "./history";

export class PluginContext {
	app: App;
	settings: PluginSettings;

	currentFile: CurrentChecker;
	relativeFilesUpdater: Updater;
	rootFile: Value<null | TFile>;
	isAutoRefresh: Value<boolean>;
	highlighted: CurrentChecker;
	history: FilesHistory;
	expanded: ValueCollection<boolean>;

	constructor(p: Pick<PluginContext, "app" | "settings">) {
		this.app = p.app;
		this.settings = p.settings;

		this.currentFile = new CurrentChecker(
			this.app.workspace.getActiveFile()?.path,
		);

		this.relativeFilesUpdater = new Updater();

		this.rootFile = new Value<null | TFile>(null);

		this.isAutoRefresh = new Value<boolean>(false);

		this.highlighted = new CurrentChecker(null);

		this.history = new FilesHistory();

		this.expanded = new ValueCollection(false);
	}
}