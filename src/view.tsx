import { Root, createRoot } from "react-dom/client";
import React from "react";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { MainView } from "./components/MainView";
import { TopBar } from "./components/TopBar";
import { AppContext } from "./hooks/context";
import { PLUGIN_ICON_NAME, PLUGIN_TITLE, PLUGIN_VIEW_ID } from "./constants";
import { PluginContext } from "./context";
import HierarchyViewPlugin from "main";
import { updateRootFile } from "./utils/hierarchy";

export default class HierarchyView extends ItemView {
	root: Root | null = null;
	headerRoot: Root | null = null;
	plugin: HierarchyViewPlugin;
	navigation = false;
	icon = PLUGIN_ICON_NAME;

	constructor(leaf: WorkspaceLeaf, plugin: HierarchyViewPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return PLUGIN_VIEW_ID;
	}

	getDisplayText() {
		return PLUGIN_TITLE;
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);

		const headerEl = document.createElement("div");
		this.headerRoot = createRoot(headerEl);
		this.containerEl.prepend(headerEl);

		const ctx = new PluginContext({
			app: this.app,
			settings: this.plugin.settings,
			saveSettings: this.plugin.saveSettings.bind(this.plugin),
		});

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", (leaf) => {
				if (leaf === null) return;

				const viewState = leaf.getViewState();

				if (viewState.type === "markdown") {
					const newFile = ctx.app.workspace.getActiveFile();
					ctx.currentFile.set(newFile?.path ?? null);
				}
			}),
		);

		this.registerEvent(
			this.app.metadataCache.on("resolve", async (file) => {
				ctx.hierarchy.getNode(file.path).updateRelatives();
			}),
		);

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", (leaf) => {
				if (leaf) {
					const viewState = leaf.getViewState();
					if (
						viewState.type === "markdown" &&
						ctx.isAutoRefresh.get()
					) {
						updateRootFile(ctx);
					}
				}
			}),
		);

		this.root.render(
			<AppContext.Provider value={ctx}>
				<MainView />
			</AppContext.Provider>,
		);

		this.headerRoot.render(
			<AppContext.Provider value={ctx}>
				<TopBar />
			</AppContext.Provider>,
		);
	}

	async onClose() {
		this.root?.unmount();
		this.headerRoot?.unmount();
	}
}
