import React, { useEffect, useRef } from 'react'
import { setIcon, type IconName } from 'obsidian'

export const ObsIcon = ({
	kind,
	className,
	onClick,
}: {
	kind: IconName
	className?: string
	onClick?: () => void
}) => {
	const ref = useRef<HTMLSpanElement>(null)

	useEffect(() => {
		if (ref.current === null) return
		setIcon(ref.current, kind)
	}, [kind, ref.current])

	return <span ref={ref} className={className} onClick={onClick} />
}
