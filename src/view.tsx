import { Root, createRoot } from "react-dom/client";
import React from "react";
import { ItemView, TFile, WorkspaceLeaf } from "obsidian";
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
	override navigation = false;
	override icon = PLUGIN_ICON_NAME;

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

	override async onOpen() {
		this.root = createRoot(this.containerEl.children[1]!);

		const headerEl = document.createElement("div");
		this.headerRoot = createRoot(headerEl);
		this.containerEl.prepend(headerEl);

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", (leaf) => {
				const oldPath = this.ctx.currentFile.get();
				let newPath: string | null = null;

				if (leaf) {
					const newFile = this.ctx.app.workspace.getActiveFile();
					newPath = newFile?.path ?? null;
				}

				if (oldPath === newPath) {
					return;
				}

				this.ctx.currentFile.set(newPath);

				if (this.ctx.settings.get("isAutoRefresh")) {
					updateRootFile(this.ctx);
				}
			}),
		);

		this.registerEvent(
			this.app.metadataCache.on("resolve", async (file) => {
				this.ctx.hierarchy.getNode(file.path).updateRelatives();
			}),
		);

		this.registerEvent(
			this.app.vault.on("rename", (newFile, oldPath) => {
				this.ctx.hierarchy.deleteNode(oldPath);
				if (
					oldPath === this.ctx.settings.current.rootFilePath &&
					newFile instanceof TFile
				) {
					updateRootFile(this.ctx, newFile, false);
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

	override async onClose() {
		this.root?.unmount();
		this.headerRoot?.unmount();
	}
}
