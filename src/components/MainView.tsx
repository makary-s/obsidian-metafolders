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
import { useUpdateCurrentFile } from "src/hooks/useUpdateCurrentFile";
import { checkHasMetaLink } from "src/utils/obsidian";

type NodeKind = "child" | "parent";
type BaseFileNodeProps = {
	file: TFile;
};

type FileNodeProps = BaseFileNodeProps & {
	kind: NodeKind;
	depth: number;
};

const NodeContent = ({
	file,
	kind,
	depth,
	expanded,
	hasChildren,
	toggleExpand,
	onClick,
}: {
	file: TFile;
	kind: NodeKind | "root";
	depth: number;
	hasChildren?: boolean;
	expanded?: boolean;
	toggleExpand?: MouseEventHandler<HTMLElement>;
	onClick: MouseEventHandler<HTMLElement>;
}) => {
	const ctx = usePluginContext();

	const expanderIcon = hasChildren
		? {
				kind: "chevron-right",
				className: expanded ? "file-node__expander_expanded" : "",
				onClick: toggleExpand,
			}
		: { kind: "dot" };

	const [highlighted, setHighlighted] = filesData.highlighted.useStore(
		file.path,
	);

	const currentFile = ctx.app.workspace.getActiveFile();

	const isLinked = currentFile
		? checkHasMetaLink(ctx, currentFile, file.basename)
		: false;
	const [linkIcon, setLinkIcon] = useState(isLinked ? "unlink" : "link");

	useEffect(() => {
		setLinkIcon(isLinked ? "unlink" : "link");
	}, [highlighted, isLinked]);

	const toggleLink: MouseEventHandler<HTMLElement> = useCallback((e) => {
		e.stopPropagation();

		const currentFile = ctx.app.workspace.getActiveFile();

		if (!currentFile || currentFile.path === file.path) return;

		ctx.app.fileManager.processFrontMatter(currentFile, (frontMatter) => {
			const isLinked = checkHasMetaLink(ctx, currentFile, file.basename);
			const newValue = `[[${file.basename}]]`;
			if (isLinked) {
				const index =
					frontMatter[ctx.settings.parentPropName].indexOf(newValue);
				if (index < 0) return;

				frontMatter[ctx.settings.parentPropName].splice(index, 1);
				setLinkIcon("link");
			} else if (frontMatter[ctx.settings.parentPropName]) {
				frontMatter[ctx.settings.parentPropName] ??= [];

				frontMatter[ctx.settings.parentPropName].push(newValue);
				setLinkIcon("unlink");
			}
		});
	}, []);

	const isCurrent = currentFile?.path === file.path;

	const isPrev =
		filesData.history.getState().files.at(-2)?.path === file.path;

	return (
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
			{hasChildren !== undefined && (
				<ObsIcon
					kind={expanderIcon.kind}
					onClick={expanderIcon.onClick}
					size="xs"
					className={[
						"file-node__expander",
						expanderIcon.className ?? "",
					].join(" ")}
				/>
			)}

			<div className="file-node__content">{file.basename}</div>
			{isPrev ? <ObsIcon size="s" disabled kind="history" /> : null}
			<div className="file-node__content-side">
				{!isCurrent && (
					<ObsIcon kind={linkIcon} onClick={toggleLink} size="xs" />
				)}
			</div>
		</div>
	);
};

function RootFileNode({ file }: BaseFileNodeProps) {
	const ctx = usePluginContext();
	const updateCurrentFile = useUpdateCurrentFile();

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
				depth={0}
				expanded
			/>

			<NodeContent
				depth={0}
				file={file}
				kind={"root"}
				onClick={onClick}
			/>

			<FileRelatives
				files={childFilesAsync.data}
				hasIndent={false}
				highlight={highlighted}
				kind="child"
				onIndentHover={setHighlighted}
				depth={0}
				expanded
			/>
		</div>
	);
}

function FileNode({ file, kind, depth }: FileNodeProps) {
	const ctx = usePluginContext();
	const updateCurrentFile = useUpdateCurrentFile();
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

	const hasChildren =
		relativeFilesAsync.status !== "loading" &&
		relativeFilesAsync.data.length !== 0;

	return (
		<div className={`file-node file-node_kind-${kind}`}>
			<NodeContent
				depth={depth}
				file={file}
				kind={kind}
				onClick={onClick}
				hasChildren={hasChildren}
				expanded={expanded}
				toggleExpand={toggleExpand}
			/>
			{relativeFilesAsync.status === "ready" ? (
				<FileRelatives
					files={relativeFilesAsync.data}
					hasIndent
					highlight={highlighted}
					kind={kind}
					onIndentHover={setHighlighted}
					depth={depth + 1}
					expanded={expanded}
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
}) {
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
}

export const MainView = () => {
	const ctx = usePluginContext();
	const { value: rootFile } = useStore(filesData.rootFile);

	const updateCurrentFile = useUpdateCurrentFile();

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
	}, [updateCurrentFile]);

	if (!rootFile) return null;

	return <RootFileNode file={rootFile} key={rootFile.path} />;
};
