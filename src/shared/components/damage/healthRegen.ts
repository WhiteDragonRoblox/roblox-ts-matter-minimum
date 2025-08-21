import { component } from "@rbxts/matter";

/** 生命值再生组件 */
export const HealthRegen = component<{ regenAmount: number; lastTick?: number }>("HealthRegen");
export type HealthRegen = ReturnType<typeof HealthRegen>;
