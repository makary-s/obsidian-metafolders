import { useEffect, useState } from "react";
import { createEmptySet, getMapDefault } from "src/utils/basic";

export class CurrentChecker {
	private callbacks = new Map<string, Set<(value: boolean) => void>>();
	private currentId: null | string;

	constructor(currentId: string | null = null) {
		this.currentId = currentId;
	}

	set(newId: string | null): void {
		const oldCallbacks = this.currentId
			? this.callbacks.get(this.currentId)
			: null;

		this.currentId = newId;

		const newCallbacks = newId ? this.callbacks.get(newId) : null;

		if (oldCallbacks) {
			oldCallbacks.forEach((fn) => fn(false));
		}

		if (newCallbacks) {
			newCallbacks.forEach((fn) => fn(true));
		}
	}

	useIsCurrent(id: string): boolean {
		const [isCurrent, setCurrent] = useState(id === this.currentId);

		useEffect(() => {
			getMapDefault(this.callbacks, id, createEmptySet).add(setCurrent);

			return () => {
				this.callbacks.get(id)?.delete(setCurrent);
			};
		}, [setCurrent, id]);

		return isCurrent;
	}
}
