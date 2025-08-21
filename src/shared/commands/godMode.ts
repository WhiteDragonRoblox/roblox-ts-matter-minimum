import { CommandDefinition } from "@rbxts/cmdr";

/** 上帝模式命令定义，用于切换玩家无敌状态 */
const command: CommandDefinition = {
	Name: "godmode",
	Aliases: ["gdm", "god"],
	Description: "Turns off damage for a player",
	Args: [],
};

export = command;
