import { PluginSettings } from "./types";

export const PLUGIN_VIEW_ID = "hierarchy-view";
export const PLUGIN_ICON_NAME = "folder-up";
export const PLUGIN_TITLE = "Metafolders";

export const DEFAULT_SETTINGS: PluginSettings = {
	parentPropName: "up",
	rootFilePath: null,
	homeFilePath: null,
	isAutoRefresh: false,
	titlePropNames: ["title"],
	sortMode: {
		direction: "asc",
		kind: "title",
	},
};

export const HEADING_TITLE_PROP_NAME = "{{h1}}";
