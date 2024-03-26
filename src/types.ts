export type SortModeKind = "title" | "modifiedTime" | "createdTime";
export type SortModeDirection = "asc" | "desc";

export type SortMode = { kind: SortModeKind; direction: SortModeDirection };
