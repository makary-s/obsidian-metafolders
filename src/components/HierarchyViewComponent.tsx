import React, { MouseEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import { usePluginContext } from '../hooks/appContext';
import { getChildFiles, getParentFiles } from '../utils/hierarchyBuilder';
import { TFile } from 'obsidian';
import { useMemoAsync } from '../hooks/useMemoAsync';
import {ObsIconButton} from './ObsIconButton'


type BaseFileNodeProps = {
  file: TFile, 
  updateCurrentFile: (file?: TFile) => void
}
type FileNodeProps =  BaseFileNodeProps & {
  kind: 'child' | 'parent'
}


const RootFileNode = ({
  file, 
  updateCurrentFile
}: BaseFileNodeProps) => {
  const ctx = usePluginContext()
  const [highlight, setHighlight] = useState(false)

  const onIndentHover = useCallback((currentHovered: boolean) => {
    setHighlight(currentHovered)
  }, [file])

  const onClick: MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    const isNewTab =  e.ctrlKey || e.metaKey 
      ? e.altKey 
        ? 'split' 
        : 'tab' 
      : false

    updateCurrentFile(file)
  
    ctx.app.workspace.openLinkText(file.path, '', isNewTab, { active: true});
  }, [file])

  return (
    <div className={'file-node'}>
      <FileRelatives
        file={file}
        kind='parent' 
        highlight={highlight}
        onIndentHover={onIndentHover}
        canShowFiles={true}
        updateCurrentFile={updateCurrentFile}
        hasIndent={false}
      />
      <div
        className={[
          'file-node__container',
          highlight ? 'file-node__container_highlight' : '',
          `file-node__container_kind-root`
        ].filter(Boolean).join(' ')}
        onMouseEnter={() => onIndentHover(true)}
        onMouseLeave={() => onIndentHover(false)}
        onClick={onClick}
      >
        <div>{file.basename}</div>
      </div>
      <FileRelatives
        file={file}
        kind='child'
        highlight={highlight}
        onIndentHover={onIndentHover}
        canShowFiles={true}
        updateCurrentFile={updateCurrentFile}
        hasIndent={false}
      />
    </div>
  )
}


const FileNode = ({
  file, 
  kind,
  updateCurrentFile
}: FileNodeProps) => {
  const ctx = usePluginContext()
  const [highlight, setHighlight] = useState(false)
  const clickCount = useRef({count: 0, timestamp: -1})

  const onIndentHover = useCallback((currentHovered: boolean) => {
    setHighlight(currentHovered)
  }, [file])

  const onClick: MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    const isNewTab =  e.ctrlKey || e.metaKey 
      ? e.altKey 
        ? 'split' 
        : 'tab' 
      : false

    if (clickCount.current.count === 1) {
      const now = Date.now()
      if (now - clickCount.current.timestamp < 1000) {
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
    ctx.app.workspace.openLinkText(file.path, '', isNewTab, { active: true});
  }, [file])


  return (
    <div className={`file-node file-node_kind-${kind}`}>
      <div
        className={[
          'file-node__container',
          highlight ? 'file-node__container_highlight' : '',
          `file-node__container_kind-${kind}`
        ].filter(Boolean).join(' ')}
        onMouseEnter={() => onIndentHover(true)}
        onMouseLeave={() => onIndentHover(false)}
        onClick={onClick}
      >
        <ObsIconButton 
          kind={kind === 'child' ? "chevron-down" : "chevron-up"} 
          className={"file-node__expander"}
          // TODO: implement expanding
          onClick={() => {}}
        />
        <div>{file.basename}</div>
      </div>
      <FileRelatives
        file={file}
        kind={kind ==='child' ? 'parent' : 'child'}
        highlight={highlight}
        onIndentHover={onIndentHover}
        canShowFiles={false}
        updateCurrentFile={updateCurrentFile}
        hasIndent={true}
      />
    </div>
  )
}

const FileRelatives = ({ 
  file,
  kind,
  onIndentHover,
  highlight,
  canShowFiles: initialCanShowFiles,
  updateCurrentFile,
  hasIndent,
}: {
  file : TFile,
  kind: 'parent' | 'child',
  onIndentHover?: (hovered: boolean) => void;
  highlight: boolean,
  canShowFiles?: boolean,
  updateCurrentFile: () => void,
  hasIndent: boolean
}) => {
  const ctx = usePluginContext();

  const filesData = useMemoAsync<TFile[]>(async () => {
    switch (kind) {
      case 'parent':
        return getParentFiles(ctx, file)
      case 'child':
        return getChildFiles(ctx, file)
    }
  }, [kind, file, ctx]);

  const [canShowFiles, setCanShowFiles] = useState(initialCanShowFiles)

  const showFiles = useCallback(() => {
    setCanShowFiles(true)
  }, [])

  const onMouseEnter = useCallback(() => {
    onIndentHover?.(true)
  }, [onIndentHover])

  const onMouseLeave = useCallback(() => {
    onIndentHover?.(false)
  }, [onIndentHover])

  if (filesData.status === 'loading') return null;
  const files = filesData.data

  return (
    <div className='file-node__relatives'>
      {hasIndent && <div 
        className={"file-node__indent " + (highlight ? "file-node__indent_highlight" : "")} 
        onMouseEnter={onMouseEnter} 
        onMouseLeave={onMouseLeave}
      />}
      {Boolean(!canShowFiles && files.length) && (
         <button 
         className="file-node__load-button" 
         onClick={showFiles}>
           ...
         </button>
      )}
      <div className={"file-node__relatives-container"}>
        {Boolean(canShowFiles) && files.map(child => (
          <FileNode file={child} key={child.path} kind={kind} updateCurrentFile={updateCurrentFile}/>
        ))}
      </div>
    </div>
  )
}


const View = () => {
  const ctx = usePluginContext()

  const [file, setFile] = useState<TFile | null>(null)
  const [key,update] = useState(false)

  const updateCurrentFile = useCallback((file?: TFile) => {
    setFile(file ?? ctx.app.workspace.getActiveFile())
    update(x => !x)
  }, [])

  useEffect(() => {
    updateCurrentFile()
  }, [])

  return (
    <div>
      <button onClick={() => updateCurrentFile()}>Refresh</button>
      {file && (
        <RootFileNode
          file={file} 
          key={file.path + key} 
          updateCurrentFile={updateCurrentFile}
        />
      )}
    </div>
  )
}

export default View;

