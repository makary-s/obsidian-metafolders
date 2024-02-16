import {
	DependencyList,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

export type MemoAsyncResult<T> =
	| { status: "loading" }
	| { status: "ready"; data: T };

export const useMemoAsync = <T>(fn: () => Promise<T>, deps: DependencyList) => {
	const [data, setData] = useState<MemoAsyncResult<T>>({ status: "loading" });
	const calledCount = useRef(0);

	const update = useCallback(() => {
		if (data.status !== "loading") {
			setData({ status: "loading" });
		}

		calledCount.current += 1;
		if (calledCount.current > 1) {
			return;
		}

		fn()
			.then((x) => {
				setData({ status: "ready", data: x });
				if (calledCount.current > 1) {
					update();
				}
			})
			.finally(() => {
				calledCount.current = 0;
			});
	}, deps);

	useEffect(() => {
		update();
	}, deps);

	return [data, update] as const;
};
