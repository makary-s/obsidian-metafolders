import React, { useLayoutEffect, useRef } from "react";
import { setIcon, type IconName } from "obsidian";
import { join } from "src/utils/basic";

import css from "./ObsIcon.scss";
console.log("css", css);
export const ObsIcon = (props: {
	kind: IconName;
	className?: string;
	size?: "xs" | "s" | "m" | "xl";
}) => {
	const { kind, className, size } = props;

	const ref = useRef<HTMLElement>(null);

	useLayoutEffect(() => {
		if (ref.current === null) return;
		setIcon(ref.current, kind);
	}, [kind, ref.current]);

	return (
		<span
			ref={ref}
			className={join([
				css.obsIcon,
				size && css[`size${size}`],
				className,
			])}
		/>
	);
};
