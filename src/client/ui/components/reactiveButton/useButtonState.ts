import { useEventListener, useLatest } from "@rbxts/pretty-react-hooks";
import React, { useMemo, useState } from "@rbxts/react";
import { UserInputService } from "@rbxts/services";
import { setTimeout } from "@rbxts/set-timeout";

import { useInputDevice } from "../../hooks/useInputDevice";

/** 按钮事件接口 */
export interface ButtonEvents {
	onMouseDown: () => void;
	onMouseUp: () => void;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
}

/**
 * 根据返回的事件获取按钮的当前状态。
 * @param enabled 按钮是否启用
 * @returns 按下状态、悬停状态和 ButtonEvents 对象
 */
export function useButtonState(enabled = true): LuaTuple<[press: boolean, hover: boolean, events: ButtonEvents]> {
	const [{ press, hover }, setState] = useState<{ press: boolean; hover: boolean }>({
		press: false,
		hover: false,
	});

	const on = useLatest(enabled);
	const touch = useLatest(useInputDevice() === "touch");

	const events: ButtonEvents = useMemo(() => {
		return {
			onMouseDown: () => setState((state) => ({ ...state, press: on.current })),
			onMouseUp: () => setState((state) => ({ ...state, press: false })),
			onMouseEnter: () => setState((state) => ({ ...state, hover: on.current && !touch.current })),
			onMouseLeave: () => setState({ press: false, hover: false }),
		};
	}, []);

	// 触摸设备可能不会触发鼠标离开事件，所以假设所有释放都是鼠标离开。
	useEventListener(UserInputService.InputEnded, (input: InputObject) => {
		if (input.UserInputType === Enum.UserInputType.Touch) {
			setTimeout(() => {
				setState({ press: false, hover: false });
			}, 0);
		}
	});

	return $tuple(press, hover, events);
}
