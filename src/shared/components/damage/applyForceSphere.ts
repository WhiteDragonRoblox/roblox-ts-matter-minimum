import { component } from "@rbxts/matter";
import { DamageType } from "shared/constants/data";

/** 施加力球体组件 */
export const ApplyForceSphere = component<{
	position: Vector3;
	radius: number;
	affectsPlayers: boolean;
	force: number;
}>("ApplyForceSphere");
export type ApplyForceSphere = ReturnType<typeof ApplyForceSphere>;
