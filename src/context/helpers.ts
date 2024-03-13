import { useEffect, useState } from "react";
import { createEmptySet, getMapDefault } from "src/utils/basic";

export class CurrentChecker {
	private callbacks = new Map<string, Set<(value: string | null) => void>>();
	private currentId: null | string;

	constructor(currentId: string | null = null) {
		this.currentId = currentId;
	}

	get(): string | null {
		return this.currentId;
	}

	set(newId: string | null): void {
		const oldId = this.currentId;
		this.currentId = newId;

		const newCallbacks = newId ? this.callbacks.get(newId) : null;
		const oldCallbacks = oldId ? this.callbacks.get(oldId) : null;

		if (oldCallbacks) {
			oldCallbacks.forEach((fn) => fn(newId));
		}

		if (newCallbacks) {
			newCallbacks.forEach((fn) => fn(newId));
		}
	}

	useCurrentFor(id: string): string | null {
		const [, setCurrent] = useState(this.currentId);

		useEffect(() => {
			getMapDefault(this.callbacks, id, createEmptySet).add(setCurrent);

			return () => {
				this.callbacks.get(id)?.delete(setCurrent);
			};
		}, [setCurrent, id]);

		return this.currentId;
	}
}
