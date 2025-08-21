import { AnyEntity, component } from "@rbxts/matter";
import { DamageType } from "shared/constants/data";

/** 最后受损组件 */
export const LastDamaged = component<{
	damaged: [AnyEntity, number][];
}>("LastDamaged", { damaged: [] });
export type LastDamaged = ReturnType<typeof LastDamaged>;
