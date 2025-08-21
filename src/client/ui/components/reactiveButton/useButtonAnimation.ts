import { useUpdateEffect } from "@rbxts/pretty-react-hooks";
import Roact, { useMemo } from "@rbxts/react";
import { springs } from "../../constants/springs";
import { useMotion } from "../../hooks";

/** 按钮动画接口 */
export interface ButtonAnimation {
	/**
	 * 欠阔尼弹簧。`-1` 表示完全悬停，`0` 表示中性，`1` 表示完全按下。
	 * 可能超出这个范围。
	 */
	readonly position: Roact.Binding<number>;
	/**
	 * 临界阑尼弹簧，按下时为 `1`。
	 */
	readonly press: Roact.Binding<number>;
	/**
	 * 临界阑尼弹簧，悬停时为 `1`。
	 */
	readonly hover: Roact.Binding<number>;
	/**
	 * 与 `hover` 相同，但 `pressed` 必须为 `false`。
	 */
	readonly hoverOnly: Roact.Binding<number>;
}

/**
 * 返回用于按钮动画的 `ButtonAnimation` 对象。
 * 对象提供的值包括：
 *
 * - `position`: 欠阔尼弹簧。`-1` 表示完全悬停，`0` 表示中性，
 *   `1` 表示完全按下。可能超出这个范围。
 * - `press`: 临界阑尼弹簧，按下时为 `1`。
 * - `hover`: 临界阑尼弹簧，悬停时为 `1`。
 * - `hoverExclusive`: 与 `hover` 相同，但 `pressed` 必须为 `false`。
 *
 * @param pressedState 按钮是否被按下
 * @param hoveredState 按钮是否被悬停
 * @returns ButtonAnimation 对象
 */
export function useButtonAnimation(pressedState: boolean, hoveredState: boolean): ButtonAnimation {
	const [press, pressMotion] = useMotion(0);
	const [hover, hoverMotion] = useMotion(0);
	const [hoverExclusive, hoverExclusiveMotion] = useMotion(0);
	const [position, positionMotion] = useMotion(0);

	useUpdateEffect(() => {
		pressMotion.spring(pressedState ? 1 : 0, springs.responsive);
		hoverExclusiveMotion.spring(hoveredState && !pressedState ? 1 : 0, springs.responsive);
	}, [pressedState, hoveredState]);

	useUpdateEffect(() => {
		hoverMotion.spring(hoveredState ? 1 : 0, springs.responsive);
	}, [hoveredState]);

	useUpdateEffect(() => {
		if (pressedState) {
			// hovered -> pressed
			positionMotion.spring(1, springs.responsive);
		} else if (hoveredState) {
			// pressed -> hovered
			positionMotion.spring(-1, { ...springs.bubbly, impulse: -0.1 });
		} else {
			// pressed -> unhovered, but 'hover' was not true
			positionMotion.spring(0, { ...springs.bubbly, impulse: -0.07 });
		}
	}, [pressedState]);

	useUpdateEffect(() => {
		if (hoveredState) {
			// unhovered -> hovered
			positionMotion.spring(-1, springs.responsive);
		} else {
			// hovered -> unhovered
			positionMotion.spring(0, springs.responsive);
		}
	}, [hoveredState]);

	return useMemo<ButtonAnimation>(() => {
		return {
			press,
			hover: hover.map((t: number) => math.clamp(t, 0, 1)),
			hoverOnly: hoverExclusive.map((t: number) => math.clamp(t, 0, 1)),
			position,
		};
	}, []);
}
