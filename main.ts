import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { PluginSettings } from 'src/types';
import HierarchyView from 'src/view';

const DEFAULT_SETTINGS: PluginSettings = {
	parentPropName: 'up'
}

export default class HierarchyViewPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(
			'hierarchy-view',
			(leaf) => new HierarchyView(leaf, this.settings)
		);
	
		this.addRibbonIcon('dice', 'Metafolders', () => {
			this.activateView();
		});

		this.addSettingTab(new SettingTab(this.app, this));
	}
	
	activateView() {
		this.app.workspace.detachLeavesOfType('hierarchy-view');
		this.app.workspace.getLeftLeaf(false).setViewState({
			type: 'hierarchy-view',
			active: true,
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
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
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Parent Property Name')
			.setDesc('required')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.parentPropName)
				.onChange(async (value) => {
					this.plugin.settings.parentPropName = value || DEFAULT_SETTINGS.parentPropName;
					await this.plugin.saveSettings();
				}))
	}
}