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
		if (this.current === value) return;

		this.current = value;
		this.dispatchCallbacks();
	}

	setFn(setter: (current: T) => T): void {
		const newValue = setter(this.current);

		if (this.current === newValue) return;

		this.current = newValue;
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
		if (this.get(id) === value) return;

		this.current.set(id, value);

		this.dispatchCallbacks(id);
	}

	setFn(id: string, setter: (current: T) => T): void {
		const newValue = setter(this.get(id));

		if (this.get(id) === newValue) return;

		this.current.set(id, newValue);

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
