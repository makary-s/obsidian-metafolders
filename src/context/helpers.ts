import { useEffect, useState } from "react";
import { getMapDefault } from "src/utils/basic";

const createEmptySet = <T>() => new Set<T>();

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

export class Value<T> {
	private current: T;
	private callbacks = new Set<(value: T) => void>();

	constructor(initialValue: T) {
		this.current = initialValue;
	}

	private dispatchCallbacks() {
		this.callbacks.forEach((fn) => fn(this.current));
	}

	set(value: T): void {
		this.current = value;
		this.dispatchCallbacks();
	}

	setFn(setter: (current: T) => T): void {
		this.current = setter(this.current);
		this.dispatchCallbacks();
	}

	get(): T {
		return this.current;
	}

	useValue(): T {
		const [value, setValue] = useState(this.current);

		useEffect(() => {
			this.callbacks.add(setValue);

			return () => {
				this.callbacks.delete(setValue);
			};
		}, []);

		return value;
	}
}

export class ValueCollection<T> {
	private defaultValue: T;
	private current: Map<string, T> = new Map();
	private callbacks = new Map<string, Set<(value: T) => void>>();

	constructor(defaultValue: T) {
		this.defaultValue = defaultValue;
	}

	private dispatchCallbacks(id: string) {
		const value = this.get(id);

		this.callbacks.get(id)?.forEach((fn) => fn(value));
	}

	set(id: string, value: T): void {
		this.current.set(id, value);

		this.dispatchCallbacks(id);
	}

	setFn(id: string, setter: (current: T) => T): void {
		this.current.set(id, setter(this.get(id)));

		this.dispatchCallbacks(id);
	}

	get(id: string): T {
		return this.current.has(id) ? this.current.get(id)! : this.defaultValue;
	}

	useValue(id: string): T {
		const [value, setValue] = useState(this.get(id));

		useEffect(() => {
			getMapDefault(this.callbacks, id, createEmptySet).add(setValue);

			return () => {
				this.callbacks.get(id)?.delete(setValue);
			};
		}, []);

		return value;
	}
}
