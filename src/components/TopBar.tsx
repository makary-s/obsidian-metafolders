import React, { useCallback } from "react";
import { ObsIcon } from "../baseComponents/ObsIcon";
import { useUpdateRootFile } from "../hooks/useUpdateRootFile";
import { usePluginContext } from "src/hooks/appContext";

const useProps = () => {
	const ctx = usePluginContext();
	const updateCurrentFile = useUpdateRootFile();

	const toggleAutoRefresh = useCallback(() => {
		ctx.isAutoRefresh.setFn((x) => !x);
		updateCurrentFile();
	}, []);

	const onUndo = useCallback(() => {
		const previousFile = ctx.history.undo();

		updateCurrentFile(previousFile, false);
	}, []);

	const onRedo = useCallback(() => {
		const previousFile = ctx.history.redo();

		updateCurrentFile(previousFile, false);
	}, []);

	const isAutoRefresh = ctx.isAutoRefresh.useValue();

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

	return (
		<div className="top-panel">
			<ObsIcon
				kind={p.isAutoRefresh ? "refresh-cw" : "refresh-cw-off"}
				size="s"
				onClick={p.toggleAutoRefresh}
			/>
			<div className="top-panel_history">
				<ObsIcon
					disabled={!p.hasUndo}
					kind={"arrow-left"}
					size="s"
					onClick={p.onUndo}
				/>
				<ObsIcon
					disabled={!p.hasRedo}
					kind={"arrow-right"}
					size="s"
					onClick={p.onRedo}
				/>
			</div>
		</div>
	);
};
