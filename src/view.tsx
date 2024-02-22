import { Root, createRoot } from "react-dom/client";
import React from "react";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { MainView } from "./components/MainView";
import { TopBar } from "./components/TopBar";
import { AppContext } from "./hooks/context";
import { PLUGIN_ICON_NAME, PLUGIN_TITLE, PLUGIN_VIEW_ID } from "./constants";
import { PluginContext } from "./context";
import { updateRootFile } from "./utils/hierarchy";

export default class HierarchyView extends ItemView {
	root: Root | null = null;
	headerRoot: Root | null = null;
	ctx: PluginContext;
	navigation = false;
	icon = PLUGIN_ICON_NAME;

	constructor(leaf: WorkspaceLeaf, ctx: PluginContext) {
		super(leaf);
		this.ctx = ctx;
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

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", (leaf) => {
				if (leaf === null) return;

				const viewState = leaf.getViewState();

				if (viewState.type === "markdown") {
					const newFile = this.ctx.app.workspace.getActiveFile();
					this.ctx.currentFile.set(newFile?.path ?? null);
				}
			}),
		);

		this.registerEvent(
			this.app.metadataCache.on("resolve", async (file) => {
				this.ctx.hierarchy.getNode(file.path).updateRelatives();
			}),
		);

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", (leaf) => {
				if (leaf) {
					const viewState = leaf.getViewState();
					if (
						viewState.type === "markdown" &&
						this.ctx.settings.get("isAutoRefresh")
					) {
						updateRootFile(this.ctx);
					}
				}
			}),
		);

		this.root.render(
			<AppContext.Provider value={this.ctx}>
				<MainView />
			</AppContext.Provider>,
		);

		this.headerRoot.render(
			<AppContext.Provider value={this.ctx}>
				<TopBar />
			</AppContext.Provider>,
		);
	}

	async onClose() {
		this.root?.unmount();
		this.headerRoot?.unmount();
	}
}
