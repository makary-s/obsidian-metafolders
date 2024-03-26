import { action, computed, makeObservable, observable } from "mobx";
import { HierarchyNode } from "../hierarchy/node";
import { Relation } from "../hierarchy/types";
import { PluginContext } from "src/context";
import {
	addParentLink,
	checkActiveFileHasParent,
	getActiveFileNode,
	removeParentLink,
	updateRootFile,
} from "src/utils/hierarchy";
import { MouseEventHandler } from "react";
import { getFileName, sortNodes } from "./impl";

class ViewNodeRoot {}

type ViewNodeByParent = WeakMap<NodeView | ViewNodeRoot, NodeView>;

type ViewNodeParent = NodeView | ViewNodeRoot;

const VIEW_NODES_BY_NODES = new WeakMap<HierarchyNode, ViewNodeByParent>();

export class NodeView {
	readonly id: string;
	readonly node: HierarchyNode;

	protected ctx: PluginContext;
	protected parent: ViewNodeParent;

	@observable protected expanded: boolean = true;
	@observable protected isActiveNodeParent: boolean;

	static detRootByPath(ctx: PluginContext, path: string): NodeView {
		return NodeView.detRoot(ctx, ctx.hierarchy.getNode(path));
	}

	static detRoot(ctx: PluginContext, node: HierarchyNode): NodeView {
		let viewNodeByDepth = VIEW_NODES_BY_NODES.get(node);

		if (!viewNodeByDepth) {
			viewNodeByDepth = new Map();
			VIEW_NODES_BY_NODES.set(node, viewNodeByDepth);
		}

		let viewNode = viewNodeByDepth.get(parent);

		if (!viewNode) {
			viewNode = new NodeView(ctx, node, parent);
			viewNodeByDepth.set(parent, viewNode);
		}

		return viewNode;
	}

	protected constructor(
		ctx: PluginContext,
		node: HierarchyNode,
		parent: ViewNodeParent,
	) {
		this.ctx = ctx;
		this.node = node;
		this.parent = parent;
		this.isActiveNodeParent = checkActiveFileHasParent(this.ctx, this.node);

		this.id = node.id;

		makeObservable(this);
	}

	private getRelatives(relation: Relation): NodeView[] {
		return sortNodes(
			this.ctx,
			this.node.relatives[relation],
			this.ctx.settings.current.sortMode,
		).map((relative) => {
			return new NodeView(this.ctx, relative, this);
		});
	}

	getExpanded(): boolean {
		return this.expanded;
	}

	// TODO make @computed?
	get path(): string {
		return this.node.path;
	}

	@computed
	get isPerviousHistoryItem(): boolean {
		return this.ctx.history.previous === this.node.data;
	}

	@computed
	get folderName(): string | undefined {
		const parentPath = this.node.data.parent?.path;
		if (!parentPath || parentPath === "/") {
			return undefined;
		}
		return parentPath;
	}

	@computed.struct
	get hasRelatives(): Record<Relation, boolean> {
		return {
			child: this.node.relatives.child.size > 0,
			parent: this.node.relatives.parent.size > 0,
		};
	}

	@computed.struct
	get relatives(): Record<Relation, NodeView[]> {
		return {
			child: this.getRelatives("child"),
			parent: this.getRelatives("parent"),
		};
	}

	@action
	toggleExpanded: MouseEventHandler<HTMLElement> = (event) => {
		event.stopPropagation();
		this.expanded = !this.expanded;
	};

	private clickCount = { count: 0, timestamp: -1 };

	onClick: MouseEventHandler<HTMLDivElement> = (e) => {
		const isNewTab =
			e.ctrlKey || e.metaKey ? (e.altKey ? "split" : "tab") : false;

		if (this.clickCount.count === 1) {
			const now = Date.now();
			if (now - this.clickCount.timestamp < 300) {
				this.clickCount.count = 0;
				this.clickCount.timestamp = 0;
				updateRootFile(this.ctx, this.node.data);
			} else {
				this.clickCount.count = 1;
				this.clickCount.timestamp = now;
			}
		} else {
			this.clickCount.count = 1;
			this.clickCount.timestamp = Date.now();
		}
		this.ctx.app.workspace.openLinkText(this.node.data.path, "", isNewTab, {
			active: true,
		});
	};

	getIsActiveNodeParent(): boolean {
		return this.isActiveNodeParent;
	}

	@action
	toggleActiveNodeParent: MouseEventHandler<HTMLElement> = async (event) => {
		event.stopPropagation();

		const activeNode = getActiveFileNode(this.ctx);
		if (!activeNode) return;

		if (checkActiveFileHasParent(this.ctx, this.node)) {
			await removeParentLink(this.ctx, {
				node: activeNode,
				linkedNode: this.node,
			});
		} else {
			await addParentLink(this.ctx, {
				node: activeNode,
				linkedNode: this.node,
			});
		}

		this.isActiveNodeParent = checkActiveFileHasParent(this.ctx, this.node);
	};

	@computed
	get title(): string {
		return getFileName(this.ctx, this.node.data);
	}
}
