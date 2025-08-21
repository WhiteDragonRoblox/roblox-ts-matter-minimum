import { CmdrClient, CommandContext, CommandDefinition } from "@rbxts/cmdr";

/** 关闭控制台命令定义 */
const command: CommandDefinition = {
	Name: "close",
	Aliases: ["exit"],
	Description: "Closes the console",
	Args: [],
	ClientRun: (context: CommandContext) => {
		const clientCmdr = context.Cmdr as CmdrClient;
		clientCmdr.Toggle();
		return "Closing the console";
	},
};

export = command;
