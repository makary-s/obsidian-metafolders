import { SortMode } from "./models/hierarchy/types";

export type PluginSettings = {
	parentPropName: string;
	rootFilePath: string | null;
	homeFilePath: string | null;
	isAutoRefresh: boolean;
	titlePropNames: string[];
	sortMode: SortMode;
};
