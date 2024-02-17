import React, { PropsWithChildren, useLayoutEffect, useRef } from "react";

export const Collapsible = ({
	expanded,
	msPerPx = 2,
	children,
	className,
}: PropsWithChildren<{
	expanded: boolean;
	msPerPx?: number;
	className?: string;
}>) => {
	const elRef = useRef<HTMLDivElement>(null);

	const timeoutId = useRef<NodeJS.Timeout | null>(null);
	const firstRender = useRef(true);

	useLayoutEffect(() => {
		if (firstRender.current) {
			if (elRef.current) {
				elRef.current.style.maxHeight = expanded ? "" : "0";
				firstRender.current = false;
			}
			return;
		}

		if (timeoutId.current) {
			clearTimeout(timeoutId.current);
		}

		if (elRef.current) {
			let totalHeight = 0;
			for (let i = 0; i < elRef.current.children.length; i++) {
				const child = elRef.current.children[i];
				totalHeight += child.scrollHeight;
			}

			const transitionDuration = Math.floor(msPerPx * totalHeight);

			elRef.current.style.transition = `max-height ${transitionDuration}ms`;

			if (expanded) {
				elRef.current.style.maxHeight = `${totalHeight}px`;

				const transitionDelay = Math.min(
					100,
					Math.floor(transitionDuration * 0.1),
				);

				timeoutId.current = setTimeout(() => {
					if (elRef.current) elRef.current.style.maxHeight = "";
					timeoutId.current = null;
				}, transitionDuration + transitionDelay);
			} else {
				elRef.current.style.maxHeight = `${totalHeight}px`;

				timeoutId.current = setTimeout(() => {
					if (elRef.current) elRef.current.style.maxHeight = "0";
					timeoutId.current = null;
				}, 0);
			}
		}
	}, [expanded, elRef]);

	return (
		<div ref={elRef} className={["collapsible-div", className].join(" ")}>
			{children}
		</div>
	);
};
