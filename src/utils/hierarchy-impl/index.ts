import { HierarchyNode } from "src/models/hierarchy/node";
import { getFileByPath } from "../obsidian";
import { PluginContext } from "src/context";
import { HierarchyImpl } from "src/models/hierarchy/impl";
import { getChildFiles } from "./getChildFiles";
import { getParentFiles } from "./getParentFiles";

export const createFileHierarchyImpl = (ctx: PluginContext): HierarchyImpl => ({
	getChildren: async (file) =>
		getChildFiles({
			app: ctx.app,
			file,
			parentPropName: ctx.settings.get("parentPropName"),
		}),
	getParents: async (file) =>
		getParentFiles({
			app: ctx.app,
			file,
			parentPropName: ctx.settings.get("parentPropName"),
		}),
	getFileByPath: (key) => getFileByPath(ctx.app, key),
	getPath: (file) => file.path,
	createNode: (props) => {
		return new HierarchyNode(props);
	},
});
