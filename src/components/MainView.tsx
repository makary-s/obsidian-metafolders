import React, { useMemo } from "react";
import { usePluginContext } from "../hooks/context";
import { RootFileNode } from "./FileNode/RootFileNode";
import { useAtomObject } from "src/hooks/atom";

export const MainView = () => {
	const ctx = usePluginContext();
	const rootFilePath = useAtomObject(ctx.settings, "rootFilePath");
	const rootKey = ctx.rootKey.useValue();

	const node = useMemo(() => {
		return rootFilePath ? ctx.hierarchy.getNode(rootFilePath) : null;
	}, [rootFilePath]);

	if (!node) return null;

	return (
		<div className="mf-root">
			<RootFileNode node={node} key={node.id + rootKey} />
		</div>
	);
};
