import type { Relation } from "src/models/hierarchy/types";
import type { HierarchyNode } from "src/models/hierarchy/node";

import { useMemoAsync } from "./useMemoAsync";
import { useEffect } from "react";

export const useHierarchyNodeRelatives = <T>(
	node: HierarchyNode<T>,
	relation: Relation,
) => {
	const [items, updateItems] = useMemoAsync(async () => {
		await node.updateRelatives();

		const result = node.getRelatives(relation);

		return result;
	}, [relation]);

	useEffect(() => {
		const unsubscribe = node.subscribe(relation, (node) => {
			updateItems();
		});

		return () => {
			unsubscribe();
		};
	}, [relation]);

	return [items, updateItems] as const;
};
