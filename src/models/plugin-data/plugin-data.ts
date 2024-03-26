import { action, makeAutoObservable, observable } from "mobx";
import { PluginData } from "./types";

export type PluginDataProps = {
	save: (settings: PluginData) => Promise<void>;
	defaultData: PluginData;
};

export class PluginDataStore {
	constructor(
		protected p: PluginDataProps,
		data: PluginData,
	) {
		this.data = data;
		makeAutoObservable(this);
	}

	@observable protected data: PluginData;

	get<K extends keyof PluginData>(key: K): PluginData[K] {
		return this.data[key];
	}

	@action
	async set<K extends keyof PluginData>(
		key: K,
		value: PluginData[K],
	): Promise<void> {
		this.data[key] = value;

		await this.p.save(this.data);
	}

	async setFn<K extends keyof PluginData>(
		key: K,
		fn: (prev: PluginData[K]) => PluginData[K],
	): Promise<void> {
		const newValue = fn(this.data[key]);
		await this.set(key, newValue);
	}

	@action
	async reset<K extends keyof PluginData>(key: K): Promise<void> {
		await this.set(key, this.p.defaultData[key]);
	}

	get current(): Readonly<PluginData> {
		return this.data;
	}
}
