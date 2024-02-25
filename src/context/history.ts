import { TFile } from "obsidian";
import { useAtom } from "src/hooks/atom";
import { Atom } from "src/models/atom";

export type HistoryRenderProps = { hasUndo: boolean; hasRedo: boolean };

export class FilesHistory {
	private offset = 1;
	private files: TFile[] = [];
	private value: Atom<HistoryRenderProps>;

	constructor() {
		this.value = new Atom(this.createNewValue());
	}

	private updateValue() {
		this.value.set(this.createNewValue());
	}

	private createNewValue(): HistoryRenderProps {
		const result = {
			hasUndo: this.offset < this.files.length,
			hasRedo: this.offset > 1,
		};

		return result;
	}

	useValue() {
		return useAtom(this.value);
	}

	push(newFile: TFile) {
		const newFiles = this.files
			.slice(0, this.files.length + 1 - this.offset)
			.concat(newFile);

		if (this.files.length > 20) {
			newFiles.shift();
		}

		this.files = newFiles;

		this.offset = 1;

		this.updateValue();
	}

	undo(): TFile | undefined {
		this.offset += 1;
		this.updateValue();

		return this.files.at(-this.offset);
	}

	redo(): TFile | undefined {
		this.offset -= 1;
		this.updateValue();

		return this.files.at(-this.offset);
	}

	checkPreviousFile(file: TFile): boolean {
		return this.files.at(-this.offset - 1)?.path === file.path;
	}
}
