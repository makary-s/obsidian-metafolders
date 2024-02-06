import React, {
	MouseEventHandler,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react'
import { usePluginContext } from '../hooks/appContext'
import { getChildFiles, getParentFiles } from '../utils/hierarchyBuilder'
import { TFile } from 'obsidian'
import { useMemoAsync } from '../hooks/useMemoAsync'
import { ObsIcon } from './ObsIcon'

type BaseFileNodeProps = {
	file: TFile
	updateCurrentFile: (file?: TFile) => void
}
type FileNodeProps = BaseFileNodeProps & {
	kind: 'child' | 'parent'
}

function RootFileNode({
	file,

	updateCurrentFile,
}: BaseFileNodeProps) {
	const ctx = usePluginContext()
	const [highlight, setHighlight] = useState(false)

	const onIndentHover = useCallback(
		(currentHovered: boolean) => {
			setHighlight(currentHovered)
		},
		[file]
	)

	const onClick: MouseEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			const isNewTab =
				e.ctrlKey || e.metaKey ? (e.altKey ? 'split' : 'tab') : false

			updateCurrentFile(file)

			ctx.app.workspace.openLinkText(file.path, '', isNewTab, {
				active: true,
			})
		},
		[file]
	)

	const parentFilesAsync = useMemoAsync<TFile[]>(async () => {
		return getParentFiles(ctx, file)
	}, [file, ctx])

	const childFilesAsync = useMemoAsync<TFile[]>(async () => {
		return getChildFiles(ctx, file)
	}, [file, ctx])

	if (
		parentFilesAsync.status === 'loading' ||
		childFilesAsync.status === 'loading'
	) {
		return <div>Loading...</div>
	}

	return (
		<div className="file-node">
			<FileRelatives
				files={parentFilesAsync.data}
				hasIndent={false}
				highlight={highlight}
				kind="parent"
				onIndentHover={onIndentHover}
				updateCurrentFile={updateCurrentFile}
			/>

			<div
				className={[
					'file-node__container',
					highlight ? 'file-node__container_highlight' : '',
					`file-node__container_kind-root`,
				]
					.filter(Boolean)
					.join(' ')}
				onClick={onClick}
				onMouseEnter={() => onIndentHover(true)}
				onMouseLeave={() => onIndentHover(false)}
			>
				<div>{file.basename}</div>
			</div>

			<FileRelatives
				files={childFilesAsync.data}
				hasIndent={false}
				highlight={highlight}
				kind="child"
				onIndentHover={onIndentHover}
				updateCurrentFile={updateCurrentFile}
			/>
		</div>
	)
}

function FileNode({ file, kind, updateCurrentFile }: FileNodeProps) {
	const ctx = usePluginContext()
	const [highlight, setHighlight] = useState(false)
	const clickCount = useRef({ count: 0, timestamp: -1 })

	const onIndentHover = useCallback(
		(currentHovered: boolean) => {
			setHighlight(currentHovered)
		},
		[file]
	)

	const onClick: MouseEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			const isNewTab =
				e.ctrlKey || e.metaKey ? (e.altKey ? 'split' : 'tab') : false

			if (clickCount.current.count === 1) {
				const now = Date.now()
				if (now - clickCount.current.timestamp < 300) {
					clickCount.current.count = 0
					clickCount.current.timestamp = 0
					updateCurrentFile(file)
				} else {
					clickCount.current.count = 1
					clickCount.current.timestamp = now
				}
			} else {
				clickCount.current.count = 1
				clickCount.current.timestamp = Date.now()
			}
			ctx.app.workspace.openLinkText(file.path, '', isNewTab, {
				active: true,
			})
		},
		[file]
	)

	const [expanded, setExpanded] = useState(false)

	const toggleExpand: MouseEventHandler<HTMLElement> = useCallback((e) => {
		e.stopPropagation()
		setExpanded((x) => !x)
	}, [])

	const relativeFilesAsync = useMemoAsync<TFile[]>(async () => {
		switch (kind) {
			case 'parent':
				return getParentFiles(ctx, file)
			case 'child':
				return getChildFiles(ctx, file)
		}
	}, [kind, file, ctx])

	const expanderIcon =
		relativeFilesAsync.status === 'loading'
			? { kind: 'loader' }
			: relativeFilesAsync.data.length === 0
				? { kind: 'dot' }
				: {
						kind: expanded
							? kind === 'child'
								? 'chevron-down'
								: 'chevron-up'
							: 'chevron-right',
						onClick: toggleExpand,
					}

	return (
		<div className={`file-node file-node_kind-${kind}`}>
			<div
				className={[
					'file-node__container',
					highlight ? 'file-node__container_highlight' : '',
					`file-node__container_kind-${kind}`,
				]
					.filter(Boolean)
					.join(' ')}
				onClick={onClick}
				onMouseEnter={() => onIndentHover(true)}
				onMouseLeave={() => onIndentHover(false)}
			>
				<ObsIcon {...expanderIcon} className="file-node__expander" />

				<div>{file.basename}</div>
			</div>

			{relativeFilesAsync.status === 'ready' && expanded ? (
				<FileRelatives
					files={relativeFilesAsync.data}
					hasIndent
					highlight={highlight}
					kind={kind}
					onIndentHover={onIndentHover}
					updateCurrentFile={updateCurrentFile}
				/>
			) : null}
		</div>
	)
}

function FileRelatives({
	files,
	kind,
	onIndentHover,
	highlight,
	updateCurrentFile,
	hasIndent,
}: {
	files: TFile[]
	kind: 'parent' | 'child'
	onIndentHover?: (hovered: boolean) => void
	highlight: boolean
	updateCurrentFile: () => void
	hasIndent: boolean
}) {
	const onMouseEnter = useCallback(() => {
		onIndentHover?.(true)
	}, [onIndentHover])

	const onMouseLeave = useCallback(() => {
		onIndentHover?.(false)
	}, [onIndentHover])

	return (
		<div className="file-node__relatives">
			{hasIndent ? (
				<div
					className={
						'file-node__indent ' +
						(highlight ? 'file-node__indent_highlight' : '')
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
					/>
				))}
			</div>
		</div>
	)
}

function View() {
	const ctx = usePluginContext()

	const [file, setFile] = useState<TFile | null>(null)
	const [key, update] = useState(false)

	const updateCurrentFile = useCallback((file?: TFile) => {
		setFile(file ?? ctx.app.workspace.getActiveFile())
		update((x) => !x)
	}, [])

	useEffect(() => {
		updateCurrentFile()
	}, [])

	return (
		<div>
			<div className="top-panel">
				<ObsIcon
					kind="refresh-cw"
					onClick={() => updateCurrentFile()}
				/>
			</div>

			{file ? (
				<RootFileNode
					file={file}
					key={file.path + key}
					updateCurrentFile={updateCurrentFile}
				/>
			) : null}
		</div>
	)
}

export default View
