import React, { useCallback } from "react";
import { ObsIcon } from "./ObsIcon";
import { filesData } from "../state";
import { useStore } from "zustand";
import { useUpdateCurrentFile } from "../hooks/useUpdateCurrentFile";

const useProps = () => {
	const updateCurrentFile = useUpdateCurrentFile();

	const toggleAutoRefresh = useCallback(() => {
		filesData.isAutoRefresh.setState((x) => !x);
		updateCurrentFile();
	}, []);

	const onUndo = useCallback(() => {
		const history = filesData.history.getState();

		const newOffset = history.offset + 1;
		const previousFile = history.files.at(-newOffset);

		filesData.history.setState((s) => ({
			...s,
			offset: newOffset,
		}));

		updateCurrentFile(previousFile, false);
	}, []);

	const onRedo = useCallback(() => {
		const history = filesData.history.getState();

		const newOffset = history.offset - 1;
		const previousFile = history.files.at(-newOffset);

		filesData.history.setState((s) => ({
			...s,
			offset: newOffset,
		}));

		updateCurrentFile(previousFile, false);
	}, []);

	const history = useStore(filesData.history);
	const isAutoRefresh = useStore(filesData.isAutoRefresh);

	return {
		onUndo,
		onRedo,
		undoDisabled: history.offset >= history.files.length,
		redoDisabled: history.offset <= 1,
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
					disabled={p.undoDisabled}
					kind={"arrow-left"}
					size="s"
					onClick={p.onUndo}
				/>
				<ObsIcon
					disabled={p.redoDisabled}
					kind={"arrow-right"}
					size="s"
					onClick={p.onRedo}
				/>
			</div>
		</div>
	);
};
