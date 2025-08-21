import React from "@rbxts/react";
import { RunService } from "@rbxts/services";

import { Group } from "../group";

/** 层组件属性接口 */
interface LayerProps extends React.PropsWithChildren {
	displayOrder?: number;
}

/** 层组件，在运行时使用 ScreenGui，在编辑器中使用 Group */
export function Layer({ displayOrder, children }: LayerProps) {
	return RunService.IsStudio() && !RunService.IsRunning() ? (
		<Group zIndex={displayOrder}>{children}</Group>
	) : (
		<screengui ResetOnSpawn={false} DisplayOrder={displayOrder} IgnoreGuiInset ZIndexBehavior="Sibling">
			{children}
		</screengui>
	);
}
