import { action, makeObservable, observable } from "mobx";

export interface PickerObservable {
	current: boolean;
}

export class SinglePicker<T extends object> {
	private currentTarget?: T;

	private targets = new WeakMap<T, PickerObservable>();

	@action
	pick = (target: T | null) => {
		if (target === null) {
			this.drop();
			return;
		}

		const oldTarget = this.currentTarget;

		this.currentTarget = target;

		if (oldTarget !== target) this.onDropTarget(oldTarget);
		this.onPickTarget(target);
	};

	@action
	drop = () => {
		const oldTarget = this.currentTarget;

		this.currentTarget = undefined;

		this.onDropTarget(oldTarget);
	};

	private onDropTarget = (target: T | undefined) => {
		if (target === undefined) return;

		const oldObs = this.targets.get(target);
		if (oldObs === undefined) return;

		oldObs.current = false;
	};

	private onPickTarget = (target: T) => {
		const obs = this.targets.get(target);
		if (obs === undefined) return;

		obs.current = true;
	};

	getObservable = (target: T): Readonly<PickerObservable> => {
		const oldObs = this.targets.get(target);

		if (oldObs) {
			return oldObs;
		}

		const obs = observable({
			current: target === this.currentTarget,
		});

		this.targets.set(target, obs);

		return obs;
	};

	getObservableValue(target: T): boolean {
		return this.getObservable(target).current;
	}

	getCurrent = (): T | undefined => {
		return this.currentTarget;
	};

	constructor() {
		makeObservable(this);
	}
}

export class Picker<T extends object> {
	private currentTargets: Set<T> = new Set();

	private targets = new WeakMap<T, PickerObservable>();

	@action
	pickOnly = action((target: T | null) => {
		this.clear();

		if (target === null) {
			return;
		}

		this.pickOnly(target);
	});

	@action
	pick = (target: T) => {
		if (this.currentTargets.has(target)) {
			return;
		}

		this.currentTargets.add(target);
		this.onPickTarget(target);
	};

	@action
	clear = () => {
		this.currentTargets.forEach((target) => {
			this.currentTargets.delete(target);
			this.onDropTarget(target);
		});
	};

	private onDropTarget = (target: T) => {
		const oldObs = this.targets.get(target);
		if (oldObs === undefined) return;

		oldObs.current = false;
	};

	private onPickTarget = (target: T) => {
		const obs = this.targets.get(target);
		if (obs === undefined) return;

		obs.current = true;
	};

	getObservable = (target: T): Readonly<PickerObservable> => {
		const oldObs = this.targets.get(target);

		if (oldObs) {
			return oldObs;
		}

		const obs = observable({
			current: this.currentTargets.has(target),
		});

		this.targets.set(target, obs);

		return obs;
	};

	getObservableValue(target: T): boolean {
		return this.getObservable(target).current;
	}

	getCurrent = (): Omit<Set<T>, "add" | "delete"> => {
		return this.currentTargets;
	};

	constructor() {
		makeObservable(this);
	}
}
