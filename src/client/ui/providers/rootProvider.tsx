import { ReflexProvider } from "@rbxts/react-reflex";
import React from "@rbxts/react";
import { store } from "client/store";

import { RemProvider, RemProviderProps } from "./remProvider";

/** 根提供者组件属性接口 */
interface RootProviderProps extends RemProviderProps {}

/** 根提供者组件，组合状态管理和尺寸提供者 */
export function RootProvider({ baseRem, remOverride, children }: RootProviderProps) {
	return (
		<ReflexProvider producer={store}>
			<RemProvider key="rem-provider" baseRem={baseRem} remOverride={remOverride}>
				{children}
			</RemProvider>
		</ReflexProvider>
	);
}
