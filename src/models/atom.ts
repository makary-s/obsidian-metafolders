import { createEmptySet, getMapDefault } from "src/utils/basic";

export class AtomObject<T> {
	private _current: T;
	private propCallbacks = new Map<
		PropertyKey,
		Set<(value: T[keyof T]) => void>
	>();
	private callbacks = new Set<(key: keyof T) => void>();

	constructor(obj: T) {
		this._current = obj;
	}

	get current(): Readonly<T> {
		return this._current;
	}

	private dispatchCallbacks(key: keyof T) {
		this.callbacks.forEach((fn) => fn(key));
		this.propCallbacks.get(key)?.forEach((fn) => fn(this._current[key]));
	}

	set<K extends keyof T>(key: K, value: T[K]): void {
		if (this._current[key] === value) return;

		this._current[key] = value;

		this.dispatchCallbacks(key);
	}

	setFn<K extends keyof T>(key: K, setter: (value: T[K]) => T[K]): void {
		const newValue = setter(this._current[key]);

		if (this._current[key] === newValue) return;

		this._current[key] = setter(this._current[key]);

		this.dispatchCallbacks(key);
	}

	get<K extends keyof T>(key: K): T[K] {
		return this._current[key];
	}

	subscribeProperty<K extends keyof T>(
		key: K,
		callback: (value: T[K]) => void,
	): () => void {
		getMapDefault(this.propCallbacks, key, createEmptySet).add(callback);

		return () => {
			this.propCallbacks.get(key)?.delete(callback);
		};
	}

	subscribe(callback: (value: keyof T) => void): () => void {
		this.callbacks.add(callback);

		return () => {
			this.callbacks.delete(callback);
		};
	}
}
