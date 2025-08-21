import { component } from "@rbxts/matter";

/**
 * 指向此实体所引用模型的引用
 */
export const Renderable = component<{ model: Model; doNotDestroy?: boolean }>("Renderable");
export type Renderable = ReturnType<typeof Renderable>;
