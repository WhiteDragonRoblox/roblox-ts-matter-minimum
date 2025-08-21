import { component } from "@rbxts/matter";

/**
 * 客户端组件用于识别玩家实体
 */
export const Client = component<{
	player: Player;
	loaded?: boolean;
}>("Client");
export type Client = ReturnType<typeof Client>;
