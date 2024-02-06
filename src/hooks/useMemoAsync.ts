import { DependencyList, useEffect, useState } from 'react'

export type MemoAsyncResult<T> =
	| { status: 'loading' }
	| { status: 'ready'; data: T }

export const useMemoAsync = <T>(fn: () => Promise<T>, deps: DependencyList) => {
	const [data, setData] = useState<MemoAsyncResult<T>>({ status: 'loading' })

	useEffect(() => {
		if (data.status !== 'loading') {
			setData({ status: 'loading' })
		}
		fn().then((x) => setData({ status: 'ready', data: x }))
	}, deps)

	return data
}
