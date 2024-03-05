import React, { MouseEventHandler } from "react";
import { join } from "src/utils/basic";

export const Clickable = (props: {
	as?: "span" | "div" | "button";
	disabled?: boolean;
	className?: string;
	tooltip?: string;
	onClick?: MouseEventHandler<HTMLElement>;
	children: React.ReactNode;
}) => {
	if (!props.onClick) {
		return <div className="clickable_bypass">{props.children}</div>;
	}

	const {
		className,
		disabled,
		tooltip,
		onClick,
		as: Tag = "span",
		children,
	} = props;

	return (
		<Tag
			role="button"
			title={tooltip}
			className={join(["clickable", className])}
			onClick={disabled ? undefined : onClick}
			aria-disabled={disabled}
		>
			{children}
		</Tag>
	);
};
