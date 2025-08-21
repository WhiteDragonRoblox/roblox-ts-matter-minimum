import { World } from "@rbxts/matter";
import { Renderable, ServerOwned } from "shared/components";

/** 设置服务器物理所有权系统 - 将指定实体的物理控制权转移给服务器 */
const setServerPhysOwnership = (world: World) => {
	for (const [id, owned] of world.queryChanged(ServerOwned)) {
		if (!world.contains(id)) continue;
		const renderable = world.get(id, Renderable);
		if (renderable !== undefined && owned.new !== undefined) {
			for (const part of renderable.model.GetDescendants()) {
				if (part.IsA("BasePart")) {
					if (part.Anchored) continue;
					part.SetNetworkOwner(undefined);
				}
			}
		}
	}
};

/** 导出服务器物理所有权设置系统 */
export = {
	system: setServerPhysOwnership,
};
