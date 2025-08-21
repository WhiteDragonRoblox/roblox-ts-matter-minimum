import { component } from "@rbxts/matter";
import { CurrentPlayerSave } from "shared/constants/playerSave";

/** 玩家存档组件 */
export const PlayerSave = component<{ playerId: number; save: CurrentPlayerSave }>("PlayerSave");
export type PlayerSave = ReturnType<typeof PlayerSave>;
