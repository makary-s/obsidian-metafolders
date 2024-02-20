import { useEffect } from "react";
import { BreadCrumb } from "src/models/bread-crumbs";

export const useBreadCrumpChild = (
	breadCrumb: BreadCrumb,
	path: string,
): BreadCrumb => {
	const breadCrump = breadCrumb.detChild(path);

	useEffect(() => {
		() => breadCrump.delete();
	}, [breadCrump]);

	return breadCrump;
};
