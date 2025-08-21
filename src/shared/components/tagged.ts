import { ShatterOnKill, Breakable, ShouldRespawn, DamageResistance } from "shared/components";

/** 具有与这些组件匹配的 CollectionService 标签的模型将自动添加到世界中 */
export const TAGGED_COMPONENTS = new Set([ShatterOnKill, Breakable, ShouldRespawn, DamageResistance]);
