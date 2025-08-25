import { GameAnalytics } from "@rbxts/gameanalytics";
import { Cmdr, CommandContextWithWorld } from "@rbxts/cmdr";

// 注册默认命令
Cmdr.RegisterDefaultCommands();

// 开发模式下的默认配置
const build = "0.0.3-dev";
print("Build version", build);

// 开发模式下初始化 GameAnalytics（使用测试密钥）
// 生产环境中应该从环境变量获取真实密钥

import { start } from "shared/start";
import { setupTags } from "shared/utils/setupTags";
import { ClientState } from "shared/constants/clientState";

const ReplicatedStorage = game.GetService("ReplicatedStorage");
const RunService = game.GetService("RunService");
declare const script: { systems: Folder };
// 启动服务端 ECS 框架
const world = start([script.systems, ReplicatedStorage.TS.systems], {} as ClientState)(setupTags);

// 注册命令执行前的权限检查钩子
Cmdr.Registry.RegisterHook("BeforeRun", (context: CommandContextWithWorld) => {
	const studio = RunService.IsStudio();
	// 开发模式：在 Studio 中允许所有玩家
	// 生产模式：可以根据需要添加群组权限检查
	if (studio) {
		context.world = world;
	} else {
		return "Admin only";
	}
});

// 注册命令类型和命令
//Cmdr.RegisterTypesIn(ReplicatedStorage.TS.commands.types);
Cmdr.RegisterCommandsIn(ReplicatedStorage.TS.commands);
