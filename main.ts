import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
	WorkspaceLeaf,
} from "obsidian";
import { PLUGIN_ICON_NAME, PLUGIN_TITLE, PLUGIN_VIEW_ID } from "src/constants";
import { PluginContext } from "src/context";
import { PluginSettings } from "src/types";
import HierarchyView from "src/view";

const DEFAULT_SETTINGS: PluginSettings = {
	parentPropName: "up",
	rootFilePath: null,
	homeFilePath: null,
	isAutoRefresh: false,
};

export default class HierarchyViewPlugin extends Plugin {
	ctx: PluginContext;

	override async onload() {
		const settings: PluginSettings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);

		this.ctx = new PluginContext(this, settings);

		this.registerView(
			PLUGIN_VIEW_ID,
			(leaf) => new HierarchyView(leaf, this.ctx),
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
			leaf = leaves[0]!;
		} else {
			leaf = workspace.getLeftLeaf(false);
			await leaf.setViewState({ type: PLUGIN_VIEW_ID, active: true });
		}

		workspace.revealLeaf(leaf);
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
			.setName("Parent property name")
			.setDesc(
				"Required. A property indicating the parent of the note. This will be used to build a hierarchy. To apply the changes correctly, it requires restarting the plugin or app after the change.",
			)
			.addText((text) =>
				text
					.setValue(this.plugin.ctx.settings.get("parentPropName"))
					.onChange(async (value) => {
						this.plugin.ctx.settings.set(
							"parentPropName",
							value || DEFAULT_SETTINGS.parentPropName,
						);
					}),
			);

		new Setting(containerEl)
			.setName("Home file path")
			.setDesc(
				"Optional. A home note for which a quick access button will be created. Enter path relative to vault root.",
			)
			.addText((text) =>
				text
					.setValue(
						this.plugin.ctx.settings.get("homeFilePath") ?? "",
					)
					.onChange(async (value) => {
						this.plugin.ctx.settings.set(
							"homeFilePath",
							value || DEFAULT_SETTINGS.homeFilePath,
						);
					}),
			);
	}
}
