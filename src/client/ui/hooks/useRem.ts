import { useCallback, useContext } from "@rbxts/react";

import { DEFAULT_REM, RemContext } from "../providers/remProvider";

/** Rem 单位选项接口 */
export interface RemOptions {
	minimum?: number;
	maximum?: number;
}

/** Rem 缩放函数重载接口 */
interface RemFunction {
	(value: number, mode?: RemScaleMode): number;
	(value: UDim2, mode?: RemScaleMode): UDim2;
	(value: UDim, mode?: RemScaleMode): UDim;
	(value: Vector2, mode?: RemScaleMode): Vector2;
}

/** Rem 缩放模式 */
type RemScaleMode = "pixel" | "unit";

/** 不同类型的缩放函数 */
const scaleFunctions = {
	number: (value: number, rem: number): number => {
		return value * rem;
	},

	UDim2: (value: UDim2, rem: number): UDim2 => {
		return new UDim2(value.X.Scale, value.X.Offset * rem, value.Y.Scale, value.Y.Offset * rem);
	},

	UDim: (value: UDim, rem: number): UDim => {
		return new UDim(value.Scale, value.Offset * rem);
	},

	Vector2: (value: Vector2, rem: number): Vector2 => {
		return new Vector2(value.X * rem, value.Y * rem);
	},
};

/** 使用 Rem 上下文并应用限制 */
function useRemContext({ minimum = 0, maximum = math.huge }: RemOptions = {}) {
	const rem = useContext(RemContext);
	return math.clamp(rem, minimum, maximum);
}

/** 响应式尺寸单位 Hook，提供基于屏幕尺寸的自适应缩放 */
export function useRem(options?: RemOptions): RemFunction {
	const rem = useRemContext(options);

	const remFunction: RemFunction = <T>(value: T, mode: RemScaleMode = "unit"): T => {
		const scale = scaleFunctions[typeOf(value) as never] as <T>(value: T, rem: number) => T;

		if (scale) {
			return mode === "unit" ? scale(value, rem) : scale(value, rem / DEFAULT_REM);
		} else {
			return value;
		}
	};

	return useCallback(remFunction, [rem]);
}
