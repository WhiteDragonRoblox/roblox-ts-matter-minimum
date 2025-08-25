import { map, useCamera, useDebounceState, useEventListener } from "@rbxts/pretty-react-hooks";
import React, { createContext, useEffect } from "@rbxts/react";

/** Rem 提供者组件属性接口 */
export interface RemProviderProps extends React.PropsWithChildren {
	baseRem?: number;
	remOverride?: number;
	minimumRem?: number;
	maximumRem?: number;
}

/** 默认 Rem 单位值 */
export const DEFAULT_REM = 16;
/** 最小 Rem 单位值 */
export const MIN_REM = 8;
/** 基础分辨率 */
const BASE_RESOLUTION = new Vector2(1920, 1020);
/** 最大宽高比 */
const MAX_ASPECT_RATIO = 19 / 9;

/** Rem 上下文，提供响应式尺寸单位 */
export const RemContext = createContext<number>(DEFAULT_REM);

/** Rem 提供者组件，根据屏幕尺寸自动计算和提供响应式尺寸单位 */
export function RemProvider({
	baseRem = DEFAULT_REM,
	minimumRem = MIN_REM,
	maximumRem = math.huge,
	remOverride,
	children,
}: RemProviderProps) {
	const camera = useCamera();
	const [rem, setRem] = useDebounceState(baseRem, { wait: 0.2 });

	/** 更新 Rem 值的计算函数 */
	const update = () => {
		const viewport = camera.ViewportSize;

		if (remOverride !== undefined) {
			return remOverride;
		}

		// wide screens should not scale beyond iPhone aspect ratio
		const resolution = new Vector2(math.min(viewport.X, viewport.Y * MAX_ASPECT_RATIO), viewport.Y);
		const scale = resolution.Magnitude / BASE_RESOLUTION.Magnitude;
		const desktop = resolution.X > resolution.Y || scale >= 1;

		// portrait mode should downscale slower than landscape
		const factor = desktop ? scale : map(scale, 0, 1, 0.25, 1);

		setRem(math.clamp(math.round(baseRem * factor), minimumRem, maximumRem));
	};

	useEventListener(camera.GetPropertyChangedSignal("ViewportSize"), update);

	useEffect(() => {
		update();
	}, [baseRem, minimumRem, maximumRem, remOverride]);

	return <RemContext.Provider value={rem}>{children}</RemContext.Provider>;
}
