import { CommandContextWithWorld } from "@rbxts/cmdr";
import { Client, GodMode, PlayerAdmin } from "shared/components";

/**
 * 上帝模式服务端执行函数
 * 切换指定玩家的无敌状态
 * @param context 包含世界和执行者信息的命令上下文
 * @returns 执行结果消息
 */
export = function (context: CommandContextWithWorld) {
	const { world, Executor } = context;
	if (world === undefined) return "World is undefined";
	let enabled = false;
	for (const [id, { player }] of world.query(Client, PlayerAdmin)) {
		if (player.UserId === Executor.UserId) {
			const godmode = world.get(id, GodMode);
			enabled = godmode === undefined;
			if (godmode === undefined) {
				world.insert(id, GodMode());
			} else {
				world.remove(id, GodMode);
			}
		}
	}
	return enabled ? `Godmode enabled for ${Executor.Name}` : `Godmode disabled for ${Executor.Name}`;
};
