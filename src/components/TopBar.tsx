import React, { useCallback } from "react";
import { ObsIcon } from "../base-components/ObsIcon";
import { usePluginContext } from "src/hooks/context";
import { getFileByPath } from "src/utils/obsidian";
import { useAtomObject } from "src/hooks/atom";
import { updateRootFile } from "src/utils/hierarchy";
import { SortMenu } from "src/components/ObsMenu";
import { Clickable } from "src/base-components/Clickable";

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

	const homeFile = homeFilePath
		? getFileByPath(ctx.app, homeFilePath)
		: undefined;

	return (
		<div className="top-panel">
			{homeFile ? (
				<Clickable
					tooltip={`Go to "${homeFile.path}"`}
					onClick={() => {
						updateRootFile(ctx, homeFile);
					}}
				>
					<ObsIcon kind="home" size="s" />
				</Clickable>
			) : null}
			<SortMenu />
			<Clickable
				onClick={p.toggleAutoRefresh}
				tooltip={p.isAutoRefresh ? "Pin root file" : "Unpin root file"}
			>
				<ObsIcon kind={p.isAutoRefresh ? "pin-off" : "pin"} size="s" />{" "}
			</Clickable>
			<Clickable onClick={ctx.rootKey.update} tooltip={"Refresh tree"}>
				<ObsIcon kind={"refresh-cw"} size="s" />{" "}
			</Clickable>
			<div className="top-panel_history">
				<Clickable
					disabled={!p.hasUndo}
					onClick={p.onUndo}
					tooltip="Undo"
				>
					<ObsIcon kind={"arrow-left"} size="s" />
				</Clickable>
				<Clickable
					disabled={!p.hasRedo}
					onClick={p.onRedo}
					tooltip="Redo"
				>
					<ObsIcon kind={"arrow-right"} size="s" />
				</Clickable>
			</div>
		</div>
	);
};
