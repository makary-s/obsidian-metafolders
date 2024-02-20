import { Relation } from "./types";

export const getOppositeRelation = (relation: Relation): Relation =>
	relation === "child" ? "parent" : "child";
