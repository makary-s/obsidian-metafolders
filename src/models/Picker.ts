import { action, observable } from "mobx";

export interface PickerObservable {
	current: boolean;
}

export class Picker<T extends object> {
	currentTarget?: T;

	targets = new WeakMap<T, PickerObservable>();

	pick = action((target: T | null) => {
		if (target === null) {
			this.drop();
			return;
		}

		const oldTarget = this.currentTarget;

		this.currentTarget = target;

		this.onDropTarget(oldTarget);
		this.onPickTarget(target);
	});

	drop = action(() => {
		const oldTarget = this.currentTarget;

		this.currentTarget = undefined;

		this.onDropTarget(oldTarget);
	});

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

	hasObservableValue = (): boolean => {
		return this.currentTarget !== undefined;
	};
}
