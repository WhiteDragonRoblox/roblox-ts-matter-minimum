import { AnyEntity, World, useEvent } from "@rbxts/matter";
import { Renderable, ServerTime, TrackSync } from "shared/components";
import syncServerTime from "./syncServerTime";

/** 循环计算动画轨道的时间位置 */
const loopOver = (trackLength: number, value: number) => {
	if (value > trackLength) {
		return value - trackLength;
	}
	return value;
};

/** 同步服务器端动画轨道与本地客户端 */
const syncServerAnimation = (world: World) => {
	for (const [id, trackSync] of world.queryChanged(TrackSync)) {
		if (!world.contains(id as AnyEntity) || trackSync.new === undefined) continue;
		const model = world.get(id, Renderable);
		if (!model || model.model === undefined) continue;
		const animationController = model.model.FindFirstChildOfClass("AnimationController");
		if (animationController === undefined) continue;
		const animator: Animator = animationController.FindFirstChild("Animator") as Animator;
		if (animator !== undefined) {
			for (const [, { serverTime }] of world.query(ServerTime)) {
				for (const track of animator.GetPlayingAnimationTracks()) {
					const animLength = track.Length;
					const serverTimeDiff = math.abs(serverTime - trackSync.new.serverTime);
					const actualTrackTime = loopOver(animLength, trackSync.new.trackTime + serverTimeDiff);
					track.TimePosition = actualTrackTime;
				}
				break;
			}
		}
	}
};

export = {
	system: syncServerAnimation,
	after: [syncServerTime],
};
