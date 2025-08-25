import "./ui/app/react-config";
import { Context, HotReloader } from "@rbxts/rewire";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import React from "@rbxts/react";
import { RootProvider } from "client/ui/providers/rootProvider";

import { App } from "./ui/app";
// 使用编译时环境变量检测
const production = false; // 开发模式
const ReplicatedStorage = game.GetService("ReplicatedStorage");
const Players = game.GetService("Players");
const root = createRoot(new Instance("Folder"));

/**
 * 初始化用户界面
 * 创建 React 根组件并渲染到玩家 GUI 中
 */
const initUI = () => {
	const target = Players.LocalPlayer.WaitForChild("PlayerGui");

	root.render(
		createPortal(
			<RootProvider key="root-provider">
				<App key="app" />
			</RootProvider>,
			target,
		),
	);
};

initUI();

if (!production) {
	const hotReloader = new HotReloader();
	const uiFolders = ReplicatedStorage.Client.ui.GetChildren().filter((child) => child.IsA("Folder"));
}
