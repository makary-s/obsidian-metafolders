import React, {
	MouseEventHandler,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { useStore } from "zustand";
import { usePluginContext } from "../hooks/appContext";
import { getChildFiles, getParentFiles } from "../utils/hierarchyBuilder";
import { TFile } from "obsidian";
import { useMemoAsync } from "../hooks/useMemoAsync";
import { ObsIcon } from "./ObsIcon";
import { filesData } from "src/state";

type BaseFileNodeProps = {
	file: TFile;
	updateCurrentFile: (file?: TFile) => void;
};

type FileNodeProps = BaseFileNodeProps & {
	kind: "child" | "parent";
	depth: number;
};

function RootFileNode({ file, updateCurrentFile }: BaseFileNodeProps) {
	const ctx = usePluginContext();

	const [highlighted, setHighlighted] = filesData.highlighted.useStore(
		file.path,
	);

	const onClick: MouseEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			const isNewTab =
				e.ctrlKey || e.metaKey ? (e.altKey ? "split" : "tab") : false;

			updateCurrentFile(file);

			ctx.app.workspace.openLinkText(file.path, "", isNewTab, {
				active: true,
			});
		},
		[file],
	);

	const parentFilesAsync = useMemoAsync<TFile[]>(async () => {
		return getParentFiles(ctx, file);
	}, [file, ctx]);

	const childFilesAsync = useMemoAsync<TFile[]>(async () => {
		return getChildFiles(ctx, file);
	}, [file, ctx]);

	if (
		parentFilesAsync.status === "loading" ||
		childFilesAsync.status === "loading"
	) {
		return null;
	}

	return (
		<div className="file-node">
			<FileRelatives
				files={parentFilesAsync.data}
				hasIndent={false}
				highlight={highlighted}
				kind="parent"
				onIndentHover={setHighlighted}
				updateCurrentFile={updateCurrentFile}
				depth={0}
			/>

			<div
				className={[
					"file-node__container",
					highlighted ? "file-node__container_highlight" : "",
					`file-node__container_kind-root`,
				]
					.filter(Boolean)
					.join(" ")}
				onClick={onClick}
				onMouseEnter={() => setHighlighted(true)}
				onMouseLeave={() => setHighlighted(false)}
			>
				<div>{file.basename}</div>
			</div>

			<FileRelatives
				files={childFilesAsync.data}
				hasIndent={false}
				highlight={highlighted}
				kind="child"
				onIndentHover={setHighlighted}
				updateCurrentFile={updateCurrentFile}
				depth={0}
			/>
		</div>
	);
}

function FileNode({ file, kind, updateCurrentFile, depth }: FileNodeProps) {
	const ctx = usePluginContext();
	const clickCount = useRef({ count: 0, timestamp: -1 });

	const [highlighted, setHighlighted] = filesData.highlighted.useStore(
		file.path,
	);

	const onClick: MouseEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			const isNewTab =
				e.ctrlKey || e.metaKey ? (e.altKey ? "split" : "tab") : false;

			if (clickCount.current.count === 1) {
				const now = Date.now();
				if (now - clickCount.current.timestamp < 300) {
					clickCount.current.count = 0;
					clickCount.current.timestamp = 0;
					updateCurrentFile(file);
				} else {
					clickCount.current.count = 1;
					clickCount.current.timestamp = now;
				}
			} else {
				clickCount.current.count = 1;
				clickCount.current.timestamp = Date.now();
			}
			ctx.app.workspace.openLinkText(file.path, "", isNewTab, {
				active: true,
			});
		},
		[file],
	);

	const [expanded, setExpanded] = filesData.expanded.useStore(
		`${file.path}::${kind}::${depth}`,
	);

	const toggleExpand: MouseEventHandler<HTMLElement> = useCallback((e) => {
		e.stopPropagation();
		setExpanded((x) => !x);
	}, []);

	const relativeFilesAsync = useMemoAsync<TFile[]>(async () => {
		switch (kind) {
			case "parent":
				return getParentFiles(ctx, file);
			case "child":
				return getChildFiles(ctx, file);
		}
	}, [kind, file, ctx]);

	const expanderIcon =
		relativeFilesAsync.status === "loading"
			? { kind: "dot" }
			: relativeFilesAsync.data.length === 0
				? { kind: "dot" }
				: {
						kind: expanded
							? kind === "child"
								? "chevron-down"
								: "chevron-up"
							: "chevron-right",
						onClick: toggleExpand,
					};

	return (
		<div className={`file-node file-node_kind-${kind}`}>
			<div
				className={[
					"file-node__container",
					highlighted ? "file-node__container_highlight" : "",
					`file-node__container_kind-${kind}`,
				]
					.filter(Boolean)
					.join(" ")}
				onClick={onClick}
				onMouseEnter={() => setHighlighted(true)}
				onMouseLeave={() => setHighlighted(false)}
			>
				<ObsIcon {...expanderIcon} className="file-node__expander" />

				<div>{file.basename}</div>
			</div>

			{relativeFilesAsync.status === "ready" && expanded ? (
				<FileRelatives
					files={relativeFilesAsync.data}
					hasIndent
					highlight={highlighted}
					kind={kind}
					onIndentHover={setHighlighted}
					updateCurrentFile={updateCurrentFile}
					depth={depth + 1}
				/>
			) : null}
		</div>
	);
}

function FileRelatives({
	files,
	kind,
	onIndentHover,
	highlight,
	updateCurrentFile,
	hasIndent,
	depth,
}: {
	files: TFile[];
	kind: "parent" | "child";
	onIndentHover?: (hovered: boolean) => void;
	highlight: boolean;
	updateCurrentFile: () => void;
	hasIndent: boolean;
	depth: number;
}) {
	const onMouseEnter = useCallback(() => {
		onIndentHover?.(true);
	}, [onIndentHover]);

	const onMouseLeave = useCallback(() => {
		onIndentHover?.(false);
	}, [onIndentHover]);

	return (
		<div className="file-node__relatives">
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

			<div className="file-node__relatives-container">
				{files.map((child) => (
					<FileNode
						file={child}
						key={child.path}
						kind={kind}
						updateCurrentFile={updateCurrentFile}
						depth={depth}
					/>
				))}
			</div>
		</div>
	);
}

function View() {
	const ctx = usePluginContext();
	const [key, update] = useState(false);
	const { value: rootFile } = useStore(filesData.rootFile);

	const updateCurrentFile = useCallback(
		(newFile_?: TFile) => {
			const { value: rootFile } = filesData.rootFile.getState();

			const newFile = newFile_ ?? ctx.app.workspace.getActiveFile();
			if (rootFile?.path !== newFile?.path) {
				filesData.rootFile.setState({ value: newFile });
				update((x) => !x);
			}
		},
		[update],
	);

	const [isAutoRefresh, setAutoRefresh] = useState(false);
	const toggleAutoRefresh = useCallback(() => {
		setAutoRefresh((x) => !x);
		updateCurrentFile();
	}, [setAutoRefresh]);
	const isAutoRefreshRef = useRef(isAutoRefresh);
	isAutoRefreshRef.current = isAutoRefresh;

	useEffect(() => {
		ctx.app.workspace.on("active-leaf-change", (leaf) => {
			if (leaf) {
				const viewState = leaf.getViewState();
				if (viewState.type === "markdown" && isAutoRefreshRef.current) {
					updateCurrentFile();
				}
			}
		});
		updateCurrentFile();
	}, []);

	return (
		<div>
			<div className="top-panel">
				<ObsIcon
					kind={isAutoRefresh ? "refresh-cw" : "refresh-cw-off"}
					onClick={toggleAutoRefresh}
				/>
			</div>

			{rootFile ? (
				<RootFileNode
					file={rootFile}
					key={rootFile.path + key}
					updateCurrentFile={updateCurrentFile}
				/>
			) : null}
		</div>
	);
}

export default View;
