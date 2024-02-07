import { TFile } from "obsidian";
import { createStore } from "zustand/vanilla";

type AppState = {
	rootFile: TFile | null;
};

export const appState = createStore<AppState>()(() => ({ rootFile: null }));
