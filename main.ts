import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
	WorkspaceLeaf,
} from "obsidian";
import { PLUGIN_ICON_NAME, PLUGIN_TITLE, PLUGIN_VIEW_ID } from "src/constants";
import { PluginSettings } from "src/types";
import HierarchyView from "src/view";

const DEFAULT_SETTINGS: PluginSettings = {
	parentPropName: "up",
	rootFilePath: null,
	homeFilePath: null,
};

export default class HierarchyViewPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(
			PLUGIN_VIEW_ID,
			(leaf) => new HierarchyView(leaf, this),
		);

		this.addRibbonIcon(PLUGIN_ICON_NAME, PLUGIN_TITLE, () => {
			this.activateView();
		});

		this.addSettingTab(new SettingTab(this.app, this));
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(PLUGIN_VIEW_ID);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getLeftLeaf(false);
			await leaf.setViewState({ type: PLUGIN_VIEW_ID, active: true });
		}

		workspace.revealLeaf(leaf);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SettingTab extends PluginSettingTab {
	plugin: HierarchyViewPlugin;

	constructor(app: App, plugin: HierarchyViewPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Parent Property Name")
			.setDesc(
				"Required. A property indicating the parent of the note. This will be used to build a hierarchy.",
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.parentPropName)
					.onChange(async (value) => {
						this.plugin.settings.parentPropName =
							value || DEFAULT_SETTINGS.parentPropName;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Home file path")
			.setDesc(
				"Optional. A home note for which a quick access button will be created. Enter path relative to vault root.",
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.homeFilePath ?? "")
					.onChange(async (value) => {
						this.plugin.settings.homeFilePath =
							value || DEFAULT_SETTINGS.homeFilePath;
						await this.plugin.saveSettings();
					}),
			);
	}
}
