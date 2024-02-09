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

	const isPrev =
		filesData.history.getState().files.at(-2)?.path === file.path;

	return (
		<div className={`file-node file-node_kind-${kind}`}>
			<div
				className={[
					"file-node__container",
					highlighted ? "file-node__container_highlight" : "",
					`file-node__container_kind-${kind}`,
					depth === 0 ? "" : "file-node__container_indented",
				]
					.filter(Boolean)
					.join(" ")}
				onClick={onClick}
				onMouseEnter={() => setHighlighted(true)}
				onMouseLeave={() => setHighlighted(false)}
			>
				<ObsIcon
					{...expanderIcon}
					size="s"
					className="file-node__expander"
				/>

				<div className="file-node__content">{file.basename}</div>
				{isPrev ? <ObsIcon size="s" disabled kind="history" /> : null}
				<div className="file-node__content-side"></div>
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

	const history = useStore(filesData.history);

	const updateCurrentFile = useCallback(
		(newFile_?: TFile, shouldSaveHistory = true) => {
			const { value: rootFile } = filesData.rootFile.getState();

			const newFile = newFile_ ?? ctx.app.workspace.getActiveFile();
			if (newFile && newFile.path !== rootFile?.path) {
				filesData.rootFile.setState({ value: newFile });
				update((x) => !x);
				if (shouldSaveHistory) {
					filesData.history.setState((s) => {
						const newFiles = s.files
							.slice(0, s.files.length + 1 - s.offset)
							.concat(newFile);
						if (s.files.length > 20) {
							newFiles.shift();
						}
						return {
							offset: 1,
							files: newFiles,
						};
					});
				}
			}
		},
		[update],
	);

	const isAutoRefresh = useStore(filesData.isAutoRefresh);

	const toggleAutoRefresh = useCallback(() => {
		filesData.isAutoRefresh.setState((x) => !x);
		updateCurrentFile();
	}, []);

	useEffect(() => {
		ctx.app.workspace.on("active-leaf-change", (leaf) => {
			if (leaf) {
				const viewState = leaf.getViewState();
				if (
					viewState.type === "markdown" &&
					filesData.isAutoRefresh.getState()
				) {
					updateCurrentFile();
				}
			}
		});
		updateCurrentFile();
	}, []);

	const onUndo = useCallback(() => {
		const history = filesData.history.getState();

		const newOffset = history.offset + 1;
		const previousFile = history.files.at(-newOffset);

		filesData.history.setState((s) => ({
			...s,
			offset: newOffset,
		}));

		updateCurrentFile(previousFile, false);
	}, []);

	const onRedo = useCallback(() => {
		const history = filesData.history.getState();

		const newOffset = history.offset - 1;
		const previousFile = history.files.at(-newOffset);

		filesData.history.setState((s) => ({
			...s,
			offset: newOffset,
		}));

		updateCurrentFile(previousFile, false);
	}, []);

	return (
		<div>
			<div className="top-panel">
				<div className="top-panel_history">
					<ObsIcon
						disabled={history.offset >= history.files.length}
						kind={"undo"}
						size="s"
						onClick={onUndo}
					/>
					<ObsIcon
						disabled={history.offset <= 1}
						kind={"redo"}
						size="s"
						onClick={onRedo}
					/>
				</div>
				<ObsIcon
					kind={isAutoRefresh ? "refresh-cw" : "refresh-cw-off"}
					size="s"
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
