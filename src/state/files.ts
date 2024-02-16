import { TFile } from "obsidian";
import { createCollectionStore } from "src/utils/recordStore";
import { createStore } from "zustand/vanilla";

export const filesData = {
	rootFile: createStore<{ value: null | TFile }>(() => ({
		value: null,
	})),
	isAutoRefresh: createStore<boolean>(() => false),
	history: createStore<{ files: TFile[]; offset: number }>(() => ({
		files: [],
		offset: 1,
	})),
	highlighted: createCollectionStore(false),
	expanded: createCollectionStore(false),
};
