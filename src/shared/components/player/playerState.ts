import { component } from "@rbxts/matter";
import { PlayerGameState } from "shared/constants/playerState";

/** 玩家状态组件 */
export const PlayerState = component<{
	state: PlayerGameState;
}>("PlayerState");
export type PlayerState = ReturnType<typeof PlayerState>;
