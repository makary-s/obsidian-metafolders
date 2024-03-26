import { action, makeObservable, observable } from "mobx";

export class IdObs {
	@observable private value: string = String(Date.now());

	constructor() {
		makeObservable(this);
	}

	get(): string {
		return this.value;
	}

	@action
	update = (): void => {
		this.value = String(Date.now());
	};
}
