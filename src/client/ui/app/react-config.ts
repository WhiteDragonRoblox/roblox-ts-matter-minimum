/** React 开发环境配置 */
const RunService = game.GetService("RunService");
declare const _G: { __DEV__: boolean };

/** 在 Roblox Studio 环境中启用开发模式 */
if (RunService.IsStudio()) {
	_G.__DEV__ = true;
}
