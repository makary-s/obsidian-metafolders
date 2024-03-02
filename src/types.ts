export type SortModeKind = "title" | "modifiedTime" | "createdTime";
export type SortModeDirection = "asc" | "desc";
export type SortMode = { kind: SortModeKind; direction: SortModeDirection };

export type PluginSettings = {
	parentPropName: string;
	rootFilePath: string | null;
	homeFilePath: string | null;
	isAutoRefresh: boolean;
	titlePropNames: string[];
	sortMode: SortMode;
};
