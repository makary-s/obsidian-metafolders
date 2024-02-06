import React from "react"
import { type IconName } from "obsidian"
import {ObsIcon} from './ObsIcon'

export const ObsIconButton = ({kind, className, onClick}: {
    kind: IconName, 
    className?: string, 
    onClick: () => void
}) => {
  
    return (
        <ObsIcon kind={kind} className={`obs-icon-button ${className}`} onClick={onClick}/>
    )
}