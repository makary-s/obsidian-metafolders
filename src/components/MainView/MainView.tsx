import React, { useMemo } from "react";
import { usePluginContext } from "../../hooks/context";
import { RootFileNode } from "../FileNode/RootFileNode";
import { useAtomObject } from "src/hooks/atom";

import css from "./MainView.scss";

export const MainView = () => {
	const ctx = usePluginContext();
	const rootFilePath = useAtomObject(ctx.settings, "rootFilePath");
	const rootKey = ctx.rootKey.useValue();

	const node = useMemo(() => {
		return rootFilePath ? ctx.hierarchy.getNode(rootFilePath) : null;
	}, [rootFilePath]);

	if (!node) return null;

	return (
		<div className={css.root}>
			<RootFileNode node={node} key={node.id + rootKey} />
		</div>
	);
};
