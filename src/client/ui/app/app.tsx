import React from "@rbxts/react";

import { ErrorHandler } from "../components/errorHandler";
import { Layer } from "../components/layer";
import { PlayerStats } from "../containers/playerStats";

/** 应用主组件，渲染 HUD 界面和玩家统计信息 */
export function App() {
	return (
		<ErrorHandler>
			<Layer key="hud-layer">
				<PlayerStats key="player-stats" />
			</Layer>
		</ErrorHandler>
	);
}
