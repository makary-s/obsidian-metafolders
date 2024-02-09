import { Root, createRoot } from "react-dom/client";
import React from "react";
import { ItemView, WorkspaceLeaf } from "obsidian";
import HierarchyViewComponent from "./components/HierarchyViewComponent";
import { AppContext } from "./hooks/appContext";
import { PluginSettings } from "./types";
import { getAPI } from "obsidian-dataview";
import { PLUGIN_ICON_NAME, PLUGIN_TITLE, PLUGIN_VIEW_ID } from "./constants";

export default class HierarchyView extends ItemView {
	root: Root | null = null;
	settings: PluginSettings;
	navigation = false;
	icon = PLUGIN_ICON_NAME;

	constructor(leaf: WorkspaceLeaf, settings: PluginSettings) {
		super(leaf);
		this.settings = settings;
	}

	getViewType() {
		return PLUGIN_VIEW_ID;
	}

	getDisplayText() {
		return PLUGIN_TITLE;
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);

		console.log(this.containerEl);
		const dv = getAPI(this.app);
		if (!dv) {
			this.root.render(<div>dataview is required</div>);
			return;
		}

		const ctx = { app: this.app, dv, settings: this.settings };

		this.root.render(
			<AppContext.Provider value={ctx}>
				<HierarchyViewComponent />
			</AppContext.Provider>,
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}
