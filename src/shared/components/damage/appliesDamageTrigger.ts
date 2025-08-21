import { component } from "@rbxts/matter";
import { DamageType } from "shared/constants/data";

/** 施加伤害触发器组件 */
export const AppliesDamageTrigger = component<{
	damageCooldown: number;
	damage: number;
	damageType: DamageType;
}>("AppliesDamageTrigger", { damageCooldown: 1, damage: 1, damageType: DamageType.Slash });
export type AppliesDamageTrigger = ReturnType<typeof AppliesDamageTrigger>;
