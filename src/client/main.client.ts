// 初始化游戏分析客户端
import { initializeClient } from "@rbxts/gameanalytics";
import { $env } from "rbxts-transform-env";
initializeClient();
import { AnyEntity } from "@rbxts/matter";
// 设置命令行界面
import { CmdrClient } from "@rbxts/cmdr";
CmdrClient.SetActivationKeys([Enum.KeyCode.F6]);
CmdrClient.SetEnabled(true);
import { start } from "shared/start";
import { receiveReplication } from "./receiveReplication";
import { ClientState } from "shared/constants/clientState";
import { setupTags } from "shared/utils/setupTags";
import "./initUI";
import { PreloadClientAssets } from "client/ui/utils/preloadClientAssets";
import { ConfirmLoaded } from "./network";

const ReplicatedStorage = game.GetService("ReplicatedStorage");
const StarterGui = game.GetService("StarterGui");

// 禁用默认的核心 GUI
StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Health, false);
StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, false);

// 异步预加载客户端资源
(async () => {
	print("Preloading start");
	ConfirmLoaded.fire();
	await PreloadClientAssets();
	print("Preloading ended");
})();

// 初始化客户端状态
const state: ClientState = {
	debugEnabled: false,
	entityIdMap: new Map<string, AnyEntity>(),
};

// 启动客户端 ECS 框架，配置复制接收和标签设置
start([ReplicatedStorage.Client.systems, ReplicatedStorage.TS.systems], state)(receiveReplication, setupTags);
