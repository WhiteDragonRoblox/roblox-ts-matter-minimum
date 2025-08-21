import { World } from "@rbxts/matter";
import { Renderable } from "shared/components";

const RunService = game.GetService("RunService");
const name = RunService.IsServer() ? "id" : "clientEntityId";

/**
 * 更新可渲染属性的系统
 * 当可渲染组件发生变化时，为对应的模型设置实体ID属性
 */
const updateRenderableAttribute = (world: World) => {
	for (const [id, record] of world.queryChanged(Renderable)) {
		if (record.new !== undefined) {
			record.new.model?.SetAttribute(name, id);
		}
	}
};

export = {
	system: updateRenderableAttribute,
};
