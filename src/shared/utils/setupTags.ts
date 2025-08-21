import { World, AnyEntity } from "@rbxts/matter";
import { ComponentCtor } from "@rbxts/matter/lib/component";
import { Renderable, Transform } from "../components";
import { TAGGED_COMPONENTS } from "../components/tagged";
import { TRIGGER_COMPONENTS } from "shared/components/trigger";
import { ClientState } from "shared/constants/clientState";

const Workspace = game.GetService("Workspace");
const CollectionService = game.GetService("CollectionService");
const isServer = game.GetService("RunService").IsServer();

/** 设置标签系统，为带有标签的模型创建对应的 Matter 实体 */
export function setupTags(world: World, state: ClientState): void {
	const entityKey = isServer ? "id" : "clientEntityId";
	/** 为绑定的模型生成实体和组件 */
	function spawnBound(model: Model, component: ComponentCtor): void {
		const newComponent = component();
		if (model.GetAttribute(entityKey) !== undefined) {
			const atts: Record<string, unknown> = {};
			for (const [key, value] of pairs(model.GetAttributes())) {
				if (key !== "id" && key !== "clientEntityId") {
					atts[key] = value;
				}
			}
			const entity = model.GetAttribute(entityKey) as AnyEntity;
			//print("inserting into", entity, tostring(component));
			world.insert(entity, newComponent.patch(atts));
			return;
		}
		const id = world.spawn(
			newComponent.patch(model.GetAttributes()),
			Renderable({ model }),
			Transform({ cf: model.GetPivot() }),
		);
		if (!isServer) {
			const serverId = model.GetAttribute("id") as AnyEntity;
			if (serverId !== undefined) {
				state.entityIdMap.set(`${serverId}`, id);
			}
		}
		//print("spawned", id, tostring(component));
		model.SetAttribute(entityKey, id);
	}

	for (const newComponent of [...TAGGED_COMPONENTS, ...TRIGGER_COMPONENTS]) {
		const tagName = tostring(newComponent);
		for (const instance of CollectionService.GetTagged(tagName)) {
			//print("tagged", instance.Name, tagName);
			if (instance.IsDescendantOf(Workspace)) {
				spawnBound(instance as Model, newComponent);
			}
		}

		CollectionService.GetInstanceAddedSignal(tagName).Connect((instance) => {
			if (instance.IsDescendantOf(Workspace)) {
				spawnBound(instance as Model, newComponent);
			}
		});

		CollectionService.GetInstanceRemovedSignal(tagName).Connect((instance) => {
			const id = instance.GetAttribute(entityKey) as AnyEntity;

			if (id !== undefined && world.contains(id)) {
				world.despawn(id);
			}
		});
	}
}
