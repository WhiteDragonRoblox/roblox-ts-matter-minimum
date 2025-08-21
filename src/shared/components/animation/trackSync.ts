import { component } from "@rbxts/matter";

/**
 * 同步动画轨道
 */
export const TrackSync = component<{ serverTime: number; trackTime: number; stopped?: boolean }>("TrackSync");
export type TrackSync = ReturnType<typeof TrackSync>;
