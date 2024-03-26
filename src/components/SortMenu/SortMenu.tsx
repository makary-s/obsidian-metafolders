import { Menu, Notice } from "obsidian";
import React, { useCallback, useMemo, useState } from "react";
import { ObsIcon } from "../../components-base/ObsIcon";
import { usePluginContext } from "src/hooks/plugin-context";
import { Clickable } from "src/components-base/Clickable";

import css from "./SortMenu.scss";
import { join } from "src/utils/basic";
import { SortMode, SortModeKind } from "src/types";
import { observer } from "mobx-react-lite";

const sortKindText: Record<SortModeKind, string> = {
	title: "T",
	modifiedTime: "M",
	createdTime: "C",
};

export const SortMenu = observer(() => {
	const ctx = usePluginContext();

	const [state, setState] = useState<SortMode>({
		kind: "title",
		direction: "asc",
	});

	const handleChange = useCallback((value: SortMode) => {
		setState(value);
		ctx.settings.set("sortMode", value);
		ctx.rootKey.update();
	}, []);

	const menu = useMemo(() => {
		const menu = new Menu();

		menu.addItem((item) =>
			item.setTitle("Title (A to Z)").onClick(() => {
				handleChange({
					kind: "title",
					direction: "asc",
				});
			}),
		)
			.addItem((item) =>
				item.setTitle("Title (Z to A)").onClick(() => {
					handleChange({
						kind: "title",
						direction: "desc",
					});
				}),
			)
			.addSeparator()
			.addItem((item) =>
				item.setTitle("Modified time (new to old)").onClick(() => {
					handleChange({
						kind: "modifiedTime",
						direction: "desc",
					});
				}),
			)
			.addItem((item) =>
				item.setTitle("Modified time (old to new)").onClick(() => {
					handleChange({
						kind: "modifiedTime",
						direction: "asc",
					});
				}),
			)
			.addSeparator()
			.addItem((item) =>
				item.setTitle("Created time (new to old)").onClick(() => {
					new Notice("Pasted");
					handleChange({
						kind: "createdTime",
						direction: "desc",
					});
				}),
			)
			.addItem((item) =>
				item.setTitle("Created time (old to new)").onClick(() => {
					handleChange({
						kind: "createdTime",
						direction: "asc",
					});
				}),
			);

		return menu;
	}, []);

	const onClick = useCallback(
		(event: React.MouseEvent) => {
			menu.showAtMouseEvent(event as unknown as MouseEvent);
		},
		[menu],
	);

	return (
		<Clickable
			tooltip="Change sort order"
			// TODO class name
			className={join([css.root, "obs-icon_clickable"])}
			onClick={onClick}
		>
			<span>{sortKindText[state.kind]}</span>
			<ObsIcon
				kind={
					state.direction === "asc"
						? "arrow-up-narrow-wide"
						: "arrow-down-narrow-wide"
				}
			/>
		</Clickable>
	);
});
