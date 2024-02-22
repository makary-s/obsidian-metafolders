import React from "react";
import { usePluginContext } from "../hooks/context";
import { RootFileNode } from "./FileNode/RootFileNode";
import { useAtom } from "src/hooks/atom";

export const MainView = () => {
	const ctx = usePluginContext();
	const rootFile = useAtom(ctx.rootFile);

	if (!rootFile) return null;

	return (
		<div className="mf-root">
			<RootFileNode file={rootFile} key={rootFile.path} />
		</div>
	);
};
