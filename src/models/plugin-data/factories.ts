import { Plugin } from "obsidian";
import { PluginDataStore } from "./plugin-data";
import { DEFAULT_DATA } from "./constants";

export const createPluginDataStore = async (plugin: Plugin) => {
	return new PluginDataStore(
		{
			save: plugin.saveData.bind(plugin),
			defaultData: DEFAULT_DATA,
		},
		Object.assign({}, DEFAULT_DATA, await plugin.loadData()),
	);
};
