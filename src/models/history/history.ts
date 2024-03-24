import { observable, action, computed, makeObservable } from "mobx";

type CheckItemExists<T> = (item: T) => boolean;

interface HistoryStoreProps<T> {
	maxSize: number;
	checkExists: CheckItemExists<T>;
	onChange: (item: T) => void;
}

export class HistoryStore<T> {
	constructor(protected p: HistoryStoreProps<T>) {
		makeObservable(this);
	}

	@observable items: T[] = [];
	@observable offset: number = 1;

	@computed
	get hasUndo(): boolean {
		console.log(this.items.length);
		for (let i = this.offset; i < this.items.length; i++) {
			const item = this.items.at(-i);

			if (item && this.p.checkExists(item)) {
				return true;
			} else {
				this.removeItemAtIndex(this.items.length - i);
			}
		}
		return false;
	}

	@computed
	get hasRedo(): boolean {
		for (let i = 1; i < this.offset; i++) {
			const item = this.items.at(-i);

			if (item && this.p.checkExists(item)) {
				return true;
			} else {
				this.removeItemAtIndex(this.items.length - i);
			}
		}
		return false;
	}

	@action
	push = (newItem: T): void => {
		const newItems = this.items
			.slice(0, this.items.length + 1 - this.offset)
			.concat(newItem);

		if (newItems.length > this.p.maxSize) {
			newItems.shift();
		}

		this.items = newItems;
		this.offset = 1;

		console.log("push", this.items);
	};

	@action
	undo = (): T | undefined => {
		if (this.hasUndo) {
			this.offset += 1;
			const item = this.items.at(-this.offset);
			if (item === undefined) return;

			this.p.onChange(item);

			return item;
		}
	};

	@action
	redo = (): T | undefined => {
		if (this.hasRedo) {
			this.offset -= 1;
			const item = this.items.at(-this.offset);
			if (item === undefined) return;

			this.p.onChange(item);

			return item;
		}
	};

	@computed
	get previous(): T | undefined {
		return this.items.at(-this.offset - 1);
	}

	@action
	protected removeItemAtIndex(index: number): void {
		if (index >= 0 && index < this.items.length) {
			this.items.splice(index, 1);
			if (this.offset > this.items.length) {
				this.offset = this.items.length;
			}
		}
	}
}
