import { AnyEntity, useEvent, World } from "@rbxts/matter";
// 移除 rbxts-transform-env 导入
import { Client, PlayerState, PlayerAdmin } from "shared/components";
import { PlayerGameState } from "shared/constants/playerState";
import { SystemPriority } from "shared/constants/systemPriority";
import { loadPlayer } from "shared/utils/loadPlayer";

const RunService = game.GetService("RunService");
const Players = game.GetService("Players");

/** 添加玩家系统 - 处理玩家连接和断开连接事件 */
const addPlayers = (world: World) => {
	for (const player of Players.GetPlayers()) {
		if (player.GetAttribute("id") === undefined) {
			const playerId = world.spawn(
				Client({
					player,
				}),
				PlayerState({
					state: PlayerGameState.Connected,
				}),
			);
			(async () => {
				loadPlayer(playerId as AnyEntity, player, world);
				// 在 Studio 环境中给予管理员权限
				if (RunService.IsStudio()) {
					world.insert(playerId as AnyEntity, PlayerAdmin());
				}
			})();
			print("Spawning player", player.Name, "with entity", playerId);
			player.SetAttribute("id", playerId);
		}
	}

	for (const [, player] of useEvent(Players, "PlayerRemoving")) {
		// Upon player disconnection, first set the player state to disconnected
		const playerId = player.GetAttribute("id") as AnyEntity;
		if (playerId !== undefined && world.contains(playerId)) {
			print("Disconnecting player", player.Name);
			world.insert(playerId, PlayerState({ state: PlayerGameState.Disconnected }));
		} else if (world.contains(playerId)) {
			// If the player has not been assigned an entity, then they have not
			// been fully initialized and we can just despawn them
			print("Despawning player", player.Name);
			world.despawn(playerId);
		}
	}
};

/** 导出添加玩家系统，优先级为关键 */
export = {
	system: addPlayers,
	priority: SystemPriority.CRITICAL,
};
