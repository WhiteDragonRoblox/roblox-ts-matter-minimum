import { ComponentCtor } from "@rbxts/matter/lib/component";
import { Client, TrackSync, Health, Gibs, ReceiveForce, DamageResistance } from "shared/components";

/** 应该自动复制到玩家的组件 */
export const REPLICATED_COMPONENTS = new Set<ComponentCtor>([Client, Health, Gibs, TrackSync]);
/** 应该自动复制到分配给的玩家的组件 */
export const REPLICATED_PLAYER_ONLY = new Set<ComponentCtor>([DamageResistance, ReceiveForce, Health]);
