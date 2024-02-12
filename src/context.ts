import { App } from "obsidian";
import { getAPI } from "obsidian-dataview";
import { useEffect, useState } from "react";
import { DataviewApi, PluginSettings } from "src/types";

class CurrentFile {
	private app: App;
	private files = new Map<string, Set<(value: boolean) => void>>();
	private currentPath: null | string = null;

	constructor(p: { app: App }) {
		this.app = p.app;
	}

	update(newCurrentPath: string | null): void {
		const oldFile = this.currentPath
			? this.files.get(this.currentPath)
			: null;

		this.currentPath = newCurrentPath;

		const newFile = newCurrentPath ? this.files.get(newCurrentPath) : null;

		if (oldFile) {
			oldFile.forEach((fn) => fn(false));
		}

		if (newFile) {
			newFile.forEach((fn) => fn(true));
		}
	}

	useIsCurrent(path: string) {
		const currentFile = this.app.workspace.getActiveFile();

		const [isCurrent, setCurrent] = useState(currentFile?.path === path);

		useEffect(() => {
			const current =
				this.files.get(path) ??
				this.files.set(path, new Set()).get(path)!;

			current.add(setCurrent);

			this.update(currentFile?.path ?? null);

			return () => {
				this.files.get(path)?.delete(setCurrent);
			};
		}, [setCurrent, path]);

		return isCurrent;
	}
}

export class PluginContext {
	app: App;
	settings: PluginSettings;

	dv?: DataviewApi;
	currentFile: CurrentFile;

	constructor(p: Pick<PluginContext, "app" | "settings">) {
		this.app = p.app;
		this.settings = p.settings;

		this.dv = getAPI(this.app);
		this.currentFile = new CurrentFile({ app: this.app });
	}
}
