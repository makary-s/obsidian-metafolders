import React, { useMemo } from "react";
import { usePluginContext } from "../../hooks/plugin-context";
import { RootFileNode } from "../FileNode/RootFileNode";

import css from "./MainView.scss";
import { NodeView } from "src/models/node-view";
import { observer } from "mobx-react-lite";

export const MainView = observer(() => {
	const ctx = usePluginContext();
	const rootFilePath = ctx.settings.get("rootFilePath");

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
});
