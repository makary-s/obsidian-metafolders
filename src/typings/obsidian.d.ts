import "obsidian";
import {DataviewApi} from '../types'

declare module "obsidian" {
    interface App {
        appId?: string;
        plugins: {
            enabledPlugins: Set<string>;
            plugins: {
                dataview?: {
                    api: DataviewApi;
                };
            };
        };
    }

    interface MetadataCache {
        getBacklinksForFile(file: TFile): {
            data: Record<string, LinkCache[]>
        }
    }

    interface LinkCache {
        /** could contain multiple keys joined with '.' */
        key?: string;
    }
}

declare global {
    interface Window {
        DataviewAPI?: DataviewApi;
    }
}