import React, { useCallback } from "react";
import { ObsIcon } from "../../components-base/ObsIcon/ObsIcon";
import { usePluginContext } from "src/hooks/context";
import { getRelativeFileByName } from "src/utils/obsidian";
import { useAtomObject } from "src/hooks/atom";
import { updateRootFile } from "src/utils/hierarchy";
import { SortMenu } from "src/components/SortMenu/SortMenu";
import { Clickable } from "src/components-base/Clickable/Clickable";

import css from "./TopBar.scss";

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
		? getRelativeFileByName(ctx.app, homeFilePath, "")
		: undefined;

	return (
		<div className={css.root}>
			<div className={css.left}>
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

				<Clickable
					onClick={p.toggleAutoRefresh}
					tooltip={
						p.isAutoRefresh ? "Pin root file" : "Unpin root file"
					}
				>
					<ObsIcon
						kind={p.isAutoRefresh ? "pin-off" : "pin"}
						size="s"
					/>
				</Clickable>

				<Clickable
					onClick={ctx.rootKey.update}
					tooltip={"Refresh tree"}
				>
					<ObsIcon kind={"refresh-cw"} size="s" />
				</Clickable>

				<SortMenu />
			</div>
			<div className={css.history}>
				<Clickable
					disabled={!p.hasUndo}
					onClick={p.onUndo}
					tooltip="Navigate back"
				>
					<ObsIcon kind={"arrow-left"} size="s" />
				</Clickable>

				<Clickable
					disabled={!p.hasRedo}
					onClick={p.onRedo}
					tooltip="Navigate forward"
				>
					<ObsIcon kind={"arrow-right"} size="s" />
				</Clickable>
			</div>
		</div>
	);
};
