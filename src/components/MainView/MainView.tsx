import React, { useMemo } from "react";
import { usePluginContext } from "../../hooks/context";
import { RootFileNode } from "../FileNode/RootFileNode";
import { useAtomObject } from "src/hooks/atom";

import css from "./MainView.scss";
import { NodeView } from "src/models/node-view";

export const MainView = () => {
	const ctx = usePluginContext();
	const rootFilePath = useAtomObject(ctx.settings, "rootFilePath");

	// TODO refactor?
	const node = useMemo(() => {
		const node = rootFilePath
			? NodeView.detRootByPath(ctx, rootFilePath)
			: null;
		if (node === null) return null;

		return node;
	}, [rootFilePath]);

	if (!node) return null;

	return (
		<div className={css.root}>
			<RootFileNode node={node} key={node.id + ctx.rootKey.get()} />
		</div>
	);
};
