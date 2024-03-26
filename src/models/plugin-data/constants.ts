import { PluginData } from "./types";

export const DEFAULT_DATA: PluginData = {
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
