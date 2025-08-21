import { component } from "@rbxts/matter";

/** 服务器时间组件 */
export const ServerTime = component<{ serverTime: number; lastSync?: number; latency?: number; offset?: number }>(
	"ServerTime",
);
export type ServerTime = ReturnType<typeof ServerTime>;
