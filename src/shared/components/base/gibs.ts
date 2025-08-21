import { AnyEntity, component } from "@rbxts/matter";

/**
 * 追踪和自动释放短时间存在的部件的方法
 */
export const Gibs = component<{ parts: BasePart[]; spawnTime: number; existTime: number; fadeTime: number }>("Gibs");
export type Gibs = ReturnType<typeof Gibs>;
