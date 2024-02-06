import { Root, createRoot } from "react-dom/client";
import React from 'react';
import { ItemView, WorkspaceLeaf } from 'obsidian';
import HierarchyViewComponent from './components/HierarchyViewComponent';
import {AppContext} from './hooks/appContext'
import { PluginSettings } from "./types";
import { getAPI } from "obsidian-dataview";

export default class HierarchyView extends ItemView {
  root: Root | null = null;
  settings: PluginSettings

  constructor(leaf: WorkspaceLeaf, settings: PluginSettings) {
    super(leaf);
    this.settings = settings;
  }

  getViewType() {
    return 'hierarchy-view';
  }

  getDisplayText() {
    return 'Hierarchy View';
  }

  async onOpen() {
    this.root = createRoot(this.containerEl.children[1]);

    const dv = getAPI(this.app) 
    if (!dv) {
      this.root.render(
        <div>
          dataview is required
        </div>
      )
      return
    }

    const ctx = {app:this.app,dv,settings: this.settings}

    this.root.render( 
      <AppContext.Provider value={ctx}>
        <HierarchyViewComponent/>
      </AppContext.Provider>
    );
  }

  async onClose() {
		this.root?.unmount();
	}
}