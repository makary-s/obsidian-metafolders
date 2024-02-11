import { App } from "obsidian";
import { getAPI } from "obsidian-dataview";
import { DataviewApi, PluginSettings } from "src/types";

type CurrentFileProps = {
	path: string;
	setCurrent: (value: boolean) => void;
};

class CurrentFile {
	private files = new Map<string, CurrentFileProps>();
	private currentPath: null | string = null;

	register(p: CurrentFileProps) {
		this.files.set(p.path, p);
	}

	unregister(path: string) {
		this.files.delete(path);
	}

	update(newCurrentPath: string | null): void {
		const oldFile = this.currentPath
			? this.files.get(this.currentPath)
			: null;

		this.currentPath = newCurrentPath;

		const newFile = newCurrentPath ? this.files.get(newCurrentPath) : null;

		if (oldFile) {
			oldFile.setCurrent(false);
		}

		if (newFile) {
			newFile.setCurrent(true);
		}
	}
}

export class PluginContext {
	app: App;
	settings: PluginSettings;

	dv?: DataviewApi;
	currentFile: CurrentFile = new CurrentFile();

	constructor(p: Pick<PluginContext, "app" | "settings">) {
		this.app = p.app;
		this.settings = p.settings;

		this.dv = getAPI(this.app);
	}
}
