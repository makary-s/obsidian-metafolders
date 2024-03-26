import React, { useCallback } from "react";
import { ObsIcon } from "../../components-base/ObsIcon";
import { usePluginContext } from "src/hooks/plugin-context";
import { getRelativeFileByName } from "src/utils/obsidian";
import { updateRootFile } from "src/utils/hierarchy";
import { SortMenu } from "src/components/SortMenu";
import { Clickable } from "src/components-base/Clickable";

import css from "./TopBar.scss";
import { observer } from "mobx-react-lite";

const useProps = () => {
	const ctx = usePluginContext();

	const toggleAutoRefresh = useCallback(() => {
		ctx.settings.setFn("isAutoRefresh", (x) => !x);
		updateRootFile(ctx);
	}, []);

	const isAutoRefresh = ctx.settings.get("isAutoRefresh");

	return {
		history: ctx.history,
		isAutoRefresh,
		toggleAutoRefresh,
	};
};

export const TopBar = observer(() => {
	const p = useProps();
	const ctx = usePluginContext();

	const homeFilePath = ctx.settings.get("homeFilePath");

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
					disabled={!p.history.hasUndo}
					onClick={p.history.undo}
					tooltip="Navigate back"
				>
					<ObsIcon kind={"arrow-left"} size="s" />
				</Clickable>

				<Clickable
					disabled={!p.history.hasRedo}
					onClick={p.history.redo}
					tooltip="Navigate forward"
				>
					<ObsIcon kind={"arrow-right"} size="s" />
				</Clickable>
			</div>
		</div>
	);
});
