import { createEmptySet, getMapDefault } from "src/utils/basic";

export class Atom<T> {
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

	subscribe(callback: (value: T) => void): () => void {
		this.callbacks.add(callback);

		return () => {
			this.callbacks.delete(callback);
		};
	}
}

export class AtomCollection<T> {
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

	subscribe(id: string, callback: (value: T) => void): () => void {
		getMapDefault(this.callbacks, id, createEmptySet).add(callback);

		return () => {
			this.callbacks.get(id)?.delete(callback);
		};
	}
}
