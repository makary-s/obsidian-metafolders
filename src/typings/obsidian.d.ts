import "obsidian";

declare module "obsidian" {
	interface App {
		appId?: string;
		plugins: {
			enabledPlugins: Set<string>;
		};
	}

	interface MetadataCache {
		getBacklinksForFile(file: TFile): {
			data: Record<string, LinkCache[]>;
		};
	}

	interface LinkCache {
		/** could contain multiple keys joined with '.' */
		key?: string;
	}
}
