import type {DataviewApi} from 'obsidian-dataview'
import type { App } from "obsidian";

export type PluginSettings = {
	parentPropName: string;
}

export type PluginContext = {
    app: App,
    settings: PluginSettings
    dv: DataviewApi
}

export type {DataviewApi}