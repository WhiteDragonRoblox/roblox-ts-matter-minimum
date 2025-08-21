import { component } from "@rbxts/matter";
import { DamageType } from "shared/constants/data";

/** 伤害抵抗组件 */
export const DamageResistance = component<{
	slashResistance?: number;
	bluntResistance?: number;
	explosiveResistance?: number;
	fireResistance?: number;
	electricResistance?: number;
	poisonResistance?: number;
	radiationResistance?: number;
	crushResistance?: number;
}>("DamageResistance");
export type DamageResistance = ReturnType<typeof DamageResistance>;
