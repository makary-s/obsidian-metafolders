import React, { MouseEventHandler } from "react";

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
			className={["clickable", className ?? ""].join(" ")}
			onClick={disabled ? undefined : onClick}
			aria-disabled={disabled}
		>
			{children}
		</Tag>
	);
};
