import { useEffect } from "react";

export type BreadCrumbProps = Readonly<{
	current: string;
	parent: BreadCrumb | null;
	children: Map<string, BreadCrumb>;
}>;

export class BreadCrumb {
	readonly depth: number;
	readonly pathString: string;

	static readonly SEPARATOR = ">";

	static createRoot(path: string) {
		return new BreadCrumb({
			current: path,
			parent: null,
			children: new Map(),
		});
	}

	private constructor(private p: BreadCrumbProps) {
		this.p = p;

		if (this.p.parent) {
			this.pathString = `${this.p.parent.pathString}${BreadCrumb.SEPARATOR}${this.p.current}`;
			this.depth = this.p.parent.depth + 1;
		} else {
			this.pathString = this.p.current;
			this.depth = 0;
		}
	}

	detChild(path: string): BreadCrumb {
		if (this.p.children.has(path)) {
			return this.p.children.get(path)!;
		}

		const child = new BreadCrumb({
			current: path,
			parent: this,
			children: new Map(),
		});

		this.p.children.set(path, child);

		return child;
	}

	deleteChild(path: string): void {
		this.p.children.delete(path);
	}

	delete(): void {
		if (this.p.parent) {
			this.p.parent.deleteChild(this.p.current);
		}
	}

	useChild = (path: string): BreadCrumb => {
		const breadCrump = this.detChild(path);

		useEffect(() => {
			() => breadCrump.delete();
		}, [breadCrump]);

		return breadCrump;
	};
}
