import { AnyEntity, component } from "@rbxts/matter";

/**
 * 追踪被实体触碰的模型及其相应的实体
 */
export const Touched = component<{ entities: AnyEntity[]; parts: BasePart[] }>("Touched", { entities: [], parts: [] });
export type Touched = ReturnType<typeof Touched>;
