import { useEventListener, useLatestCallback } from "@rbxts/pretty-react-hooks";
import { createMotion, Motion, MotionGoal } from "@rbxts/ripple";
import { Binding, useBinding, useEffect, useMemo } from "@rbxts/react";

const RunService = game.GetService("RunService");

/** 数值动画 Hook - 返回数值绑定和动画控制器 */
export function useMotion(initialValue: number): LuaTuple<[Binding<number>, Motion]>;

/** 泛型动画 Hook - 返回泛型绑定和动画控制器 */
export function useMotion<T extends MotionGoal>(initialValue: T): LuaTuple<[Binding<T>, Motion<T>]>;

/** 动画 Hook 实现，提供弹簧动画功能 */
export function useMotion<T extends MotionGoal>(initialValue: T) {
	const motion = useMemo(() => {
		return createMotion(initialValue);
	}, []);

	const [binding, setValue] = useBinding(initialValue);

	useEventListener(RunService.Heartbeat, (delta) => {
		const value = motion.step(delta);

		if (value !== binding.getValue()) {
			setValue(value);
		}
	});

	return $tuple(binding, motion);
}
