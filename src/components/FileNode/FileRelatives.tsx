import React, { useCallback } from "react";
import { TFile } from "obsidian";
import { NodeKind } from "./types";
import { FileNode } from "./FileNode";
import { Collapsible } from "src/baseComponents/Collapsible";
import { BreadCrumb } from "src/utils/bread-crumbs";

export const FileRelatives = ({
	files,
	kind,
	onIndentHover,
	highlight,
	hasIndent,
	breadCrumps,
	expanded,
	collapsedDepth,
}: {
	files: TFile[];
	kind: NodeKind;
	onIndentHover?: (hovered: boolean) => void;
	highlight: boolean;
	hasIndent: boolean;
	breadCrumps: BreadCrumb;
	expanded: boolean;
	collapsedDepth: number;
}) => {
	const onMouseEnter = useCallback(() => {
		onIndentHover?.(true);
	}, [onIndentHover]);

	const onMouseLeave = useCallback(() => {
		onIndentHover?.(false);
	}, [onIndentHover]);

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

			<Collapsible
				expanded={expanded}
				className="file-node__relatives-container"
			>
				{files.map((child) => (
					<FileNode
						file={child}
						key={child.path}
						kind={kind}
						parentBreadCrumps={breadCrumps}
						collapsedDepth={collapsedDepth}
					/>
				))}
			</Collapsible>
		</div>
	);
};
