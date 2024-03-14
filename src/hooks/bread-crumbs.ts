import { useEffect } from "react";
import { BreadCrumb } from "src/models/bread-crumbs";

export const useBreadCrumpChild = (
	breadCrumb: BreadCrumb,
	key: string,
): BreadCrumb => {
	const breadCrump = breadCrumb.detChild(key);

	useEffect(() => {
		() => breadCrump.delete();
	}, [breadCrump]);

	return breadCrump;
};
