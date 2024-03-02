import React from "react";
import { usePluginContext } from "../hooks/context";
import { RootFileNode } from "./FileNode/RootFileNode";
import { useAtomObject } from "src/hooks/atom";
import { getFileByPath } from "src/utils/obsidian";

export const MainView = () => {
	const ctx = usePluginContext();
	const rootFilePath = useAtomObject(ctx.settings, "rootFilePath");
	const rootFile = rootFilePath ? getFileByPath(ctx.app, rootFilePath) : null;
	const rootKey = ctx.rootKey.useValue();

	if (!rootFile) return null;

	return (
		<div className="mf-root">
			<RootFileNode file={rootFile} key={rootFile.path + rootKey} />
		</div>
	);
};
