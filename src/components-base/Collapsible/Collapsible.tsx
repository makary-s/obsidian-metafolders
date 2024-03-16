import React, { PropsWithChildren, useLayoutEffect, useRef } from "react";
import { clampNumber, join } from "src/utils/basic";

import css from "./Collapsible.scss";

const MAX_MS_PER_PX = 300;
const MIN_MS_PER_PX = 80;

export const Collapsible = ({
	expanded,
	msPerPx = 0.5,
	children,
	className,
}: PropsWithChildren<{
	expanded: boolean;
	msPerPx?: number;
	className?: string;
}>) => {
	const elRef = useRef<HTMLDivElement>(null);
	const timeoutId = useRef<number | null>(null);
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
			const totalHeight = Array.from(elRef.current.children).reduce(
				(total, child) => total + child.scrollHeight,
				0,
			);

			const transitionDuration = Math.floor(
				clampNumber(
					msPerPx * totalHeight,
					MIN_MS_PER_PX,
					MAX_MS_PER_PX,
				),
			);

			elRef.current.style.transition = `max-height ${transitionDuration}ms`;

			if (expanded) {
				elRef.current.style.maxHeight = `${totalHeight}px`;
				const transitionDelay = Math.min(
					100,
					Math.floor(transitionDuration * 0.1),
				);
				timeoutId.current = window.setTimeout(() => {
					if (elRef.current) elRef.current.style.maxHeight = "";
					timeoutId.current = null;
				}, transitionDuration + transitionDelay);
			} else {
				elRef.current.style.maxHeight = `${totalHeight}px`;
				timeoutId.current = window.setTimeout(() => {
					if (elRef.current) elRef.current.style.maxHeight = "0";
					timeoutId.current = null;
				}, 0);
			}
		}
	}, [expanded, elRef, msPerPx]);

	return (
		<div ref={elRef} className={join([css.root, className])}>
			{children}
		</div>
	);
};
