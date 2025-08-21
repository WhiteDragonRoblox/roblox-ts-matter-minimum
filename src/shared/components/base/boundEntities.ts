import { AnyEntity, component } from "@rbxts/matter";

/**
 * 根据它们的工作区模型追踪实体的方法
 */
export const BoundEntities = component<{ models: Model[]; entities: AnyEntity[] }>("BoundEntities", {
	models: [],
	entities: [],
});
export type BoundEntities = ReturnType<typeof BoundEntities>;
