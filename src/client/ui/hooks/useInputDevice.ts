import { useEventListener } from "@rbxts/pretty-react-hooks";
import { useState } from "@rbxts/react";

const UserInputService = game.GetService("UserInputService");
/** 输入设备类型 */
export type InputDevice = "keyboard" | "gamepad" | "touch";

/** 根据 Roblox 输入类型获取输入设备类型 */
const getInputType = (inputType = UserInputService.GetLastInputType()): InputDevice | undefined => {
	if (inputType === Enum.UserInputType.Keyboard || inputType === Enum.UserInputType.MouseMovement) {
		return "keyboard";
	} else if (inputType === Enum.UserInputType.Gamepad1) {
		return "gamepad";
	} else if (inputType === Enum.UserInputType.Touch) {
		return "touch";
	}
};

/**
 * 获取玩家正在使用的当前输入设备。
 * @returns InputDevice 字符串
 */
export function useInputDevice() {
	const [device, setDevice] = useState<InputDevice>(() => {
		return getInputType() ?? "keyboard";
	});

	useEventListener(UserInputService.LastInputTypeChanged, (inputType) => {
		const newDevice = getInputType(inputType);

		if (newDevice !== undefined) {
			setDevice(newDevice);
		}
	});

	return device;
}
