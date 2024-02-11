import React, { useCallback, useEffect, useRef, useState } from "react";
import { TFile } from "obsidian";
import { NodeKind } from "./types";
import { FileNode } from "./FileNode";

export const FileRelatives = ({
	files,
	kind,
	onIndentHover,
	highlight,
	hasIndent,
	depth,
	expanded,
}: {
	files: TFile[];
	kind: NodeKind;
	onIndentHover?: (hovered: boolean) => void;
	highlight: boolean;
	hasIndent: boolean;
	depth: number;
	expanded: boolean;
}) => {
	const onMouseEnter = useCallback(() => {
		onIndentHover?.(true);
	}, [onIndentHover]);

	const onMouseLeave = useCallback(() => {
		onIndentHover?.(false);
	}, [onIndentHover]);

	const containerRef = useRef<HTMLDivElement>(null);

	const [marginTop, setMarginTop] = useState(expanded ? "0" : "-100vh"); // TODO collapsed initial value

	useEffect(() => {
		setMarginTop(
			expanded
				? "0"
				: containerRef.current === null
					? "-1000px"
					: `-${containerRef.current.scrollHeight}px`,
		);
	}, [expanded]);

	return (
		<div
			className={[
				"file-node__relatives",
				expanded ? "" : "file-node__relatives_hidden",
			].join(" ")}
		>
			{hasIndent ? (
				<div
					className={
						"file-node__indent " +
						(highlight ? "file-node__indent_highlight" : "")
					}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
				/>
			) : null}

			<div className="file-node__relatives-overflow-wrapper">
				<div
					className="file-node__relatives-container"
					ref={containerRef}
					style={{
						marginTop: marginTop,
					}}
				>
					{files.map((child) => (
						<FileNode
							file={child}
							key={child.path}
							kind={kind}
							depth={depth}
						/>
					))}
				</div>
			</div>
		</div>
	);
};
