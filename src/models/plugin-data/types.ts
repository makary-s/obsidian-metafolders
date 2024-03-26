import type { SortMode } from "src/types";

export type { PluginDataStore as SettingsStore } from "./plugin-data";

export type PluginData = {
	parentPropName: string;
	rootFilePath: string | null;
	homeFilePath: string | null;
	isAutoRefresh: boolean;
	titlePropNames: string[];
	sortMode: SortMode;
};
