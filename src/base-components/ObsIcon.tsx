import React, { MouseEventHandler, useLayoutEffect, useRef } from "react";
import { setIcon, type IconName } from "obsidian";

export const ObsIcon = (props: {
	kind: IconName;
	disabled?: boolean;
	className?: string;
	size?: "xs" | "s" | "m" | "xl";
	tooltip?: string;
	onClick?: MouseEventHandler<HTMLElement>;
}) => {
	const { kind, className, disabled, size, tooltip } = props;
	const onClick = disabled ? undefined : props.onClick;

	const ref = useRef<HTMLElement>(null);

	useLayoutEffect(() => {
		if (ref.current === null) return;
		setIcon(ref.current, kind);
	}, [kind, ref.current]);

	const finalClassName = [
		"obs-icon",
		onClick ? "obs-icon_clickable" : "",
		disabled ? "obs-icon_disabled" : "",
		size ? `obs-icon_size-${size}` : "",
		className,
	].join(" ");

	return (
		<span
			title={tooltip}
			ref={ref}
			className={finalClassName}
			onClick={onClick}
		/>
	);
};
