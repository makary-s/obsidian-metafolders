import React, { MouseEventHandler, useEffect, useRef } from "react";
import { setIcon, type IconName } from "obsidian";

export const ObsIcon = (props: {
	kind: IconName;
	disabled?: boolean;
	className?: string;
	size?: "s" | "m" | "xl";
	onClick?: MouseEventHandler<HTMLElement>;
}) => {
	const { kind, className, disabled, size } = props;
	const onClick = disabled ? undefined : props.onClick;

	const ref = useRef<HTMLElement>(null);

	useEffect(() => {
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

	return <span ref={ref} className={finalClassName} onClick={onClick} />;
};
