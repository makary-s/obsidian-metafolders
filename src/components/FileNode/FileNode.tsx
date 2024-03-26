import React from "react";
import { FileNodeProps } from "./types";
import { FileNodeContent } from "./Content/FileNodeContent";
import { FileRelatives } from "./Relatives/FileRelatives";

import css from "./FileNode.scss";
import { join } from "src/utils/basic";

export const FileNode = ({ node, kind }: FileNodeProps) => {
	return (
		<div className={join([css.root, css[`kind_${kind}`]])}>
			<FileNodeContent node={node} kind={kind} />
			<FileRelatives node={node} hasIndent kind={kind} />
		</div>
	);
};
