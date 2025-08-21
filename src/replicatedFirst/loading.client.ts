// 获取服务和本地玩家
const Players = game.GetService("Players");
const ReplicatedFirst = game.GetService("ReplicatedFirst");
const LocalPlayer = Players.LocalPlayer;
const gui = LocalPlayer.WaitForChild("PlayerGui");

// 创建加载屏幕界面
const screenGui = new Instance("ScreenGui");
screenGui.IgnoreGuiInset = true;
screenGui.Parent = gui;

// 创建加载文本标签
const textLabel = new Instance("TextLabel");
textLabel.Size = new UDim2(1, 0, 1, 0);
textLabel.BackgroundTransparency = 0;
textLabel.BackgroundColor3 = new Color3(0, 0, 0);
textLabel.Text = "";
textLabel.TextColor3 = new Color3(1, 1, 1);
textLabel.FontFace = Font.fromId(11702779409, Enum.FontWeight.Heavy);
textLabel.TextSize = 50;
textLabel.Parent = screenGui;

// 移除默认加载屏幕并等待游戏加载完成
ReplicatedFirst.RemoveDefaultLoadingScreen();
task.wait(2);
if (!game.IsLoaded()) {
	game.Loaded.Wait();
}
// 销毁自定义加载屏幕
screenGui.Destroy();
