import React, { useCallback } from "react";
import { ObsIcon } from "../base-components/ObsIcon";
import { usePluginContext } from "src/hooks/context";
import { getFileByPath } from "src/utils/obsidian";
import { useAtomObject } from "src/hooks/atom";
import { updateRootFile } from "src/utils/hierarchy";

const useProps = () => {
	const ctx = usePluginContext();

	const toggleAutoRefresh = useCallback(() => {
		ctx.settings.setFn("isAutoRefresh", (x) => !x);
		updateRootFile(ctx);
	}, []);

	const onUndo = useCallback(() => {
		const previousFile = ctx.history.undo();

		updateRootFile(ctx, previousFile, false);
	}, []);

	const onRedo = useCallback(() => {
		const previousFile = ctx.history.redo();

		updateRootFile(ctx, previousFile, false);
	}, []);

	const isAutoRefresh = useAtomObject(ctx.settings, "isAutoRefresh");

	return {
		...ctx.history.useValue(),
		onUndo,
		onRedo,
		isAutoRefresh,
		toggleAutoRefresh,
	};
};

export const TopBar = () => {
	const p = useProps();
	const ctx = usePluginContext();

	const homeFilePath = useAtomObject(ctx.settings, "homeFilePath");

	const homeFile = homeFilePath ? getFileByPath(ctx.app, homeFilePath) : null;

	return (
		<div className="top-panel">
			{homeFile ? (
				<ObsIcon
					kind="home"
					size="s"
					onClick={() => {
						updateRootFile(ctx, homeFile);
					}}
					tooltip={`Go to "${homeFile.path}"`}
				/>
			) : null}
			<ObsIcon
				kind={p.isAutoRefresh ? "pin" : "pin-off"}
				size="s"
				onClick={p.toggleAutoRefresh}
				tooltip={p.isAutoRefresh ? "Pin root file" : "Unpin root file"}
			/>
			<div className="top-panel_history">
				<ObsIcon
					disabled={!p.hasUndo}
					kind={"arrow-left"}
					size="s"
					onClick={p.onUndo}
					tooltip="Undo"
				/>
				<ObsIcon
					disabled={!p.hasRedo}
					kind={"arrow-right"}
					size="s"
					onClick={p.onRedo}
					tooltip="Redo"
				/>
			</div>
		</div>
	);
};
