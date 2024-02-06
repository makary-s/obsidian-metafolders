import React, { MouseEventHandler, useEffect, useRef } from 'react'
import { setIcon, type IconName } from 'obsidian'

export const ObsIcon = ({
	kind,
	className,
	onClick,
}: {
	kind: IconName
	className?: string
	onClick?: MouseEventHandler<HTMLElement>
}) => {
	const ref = useRef<HTMLSpanElement>(null)

	useEffect(() => {
		if (ref.current === null) return
		setIcon(ref.current, kind)
	}, [kind, ref.current])

	const finalClassName = [
		'obs-icon',
		onClick ? 'obs-icon_clickable' : '',
		className,
	].join(' ')

	return <span ref={ref} className={finalClassName} onClick={onClick} />
}
