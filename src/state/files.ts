import { TFile } from "obsidian";
import { createCollectionStore } from "src/utils/recordStore";
import { createStore } from "zustand/vanilla";

export const filesData = {
	rootFile: createStore<{ value: null | TFile }>(() => ({
		value: null,
	})),
	highlighted: createCollectionStore(false),
	expanded: createCollectionStore(false),
	exists: createCollectionStore<null | string>(null),
};
