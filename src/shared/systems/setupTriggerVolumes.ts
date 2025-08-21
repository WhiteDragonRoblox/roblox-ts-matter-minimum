import { AnyEntity, World, log } from "@rbxts/matter";
import { ConnectedSignals, Renderable, Touched } from "shared/components";
import { TRIGGER_COMPONENTS } from "shared/components/trigger";

const isServer = game.GetService("RunService").IsServer();

const entityKey = isServer ? "id" : "clientEntityId";

/**
 * 触摸回调函数 - 当部件被触摸时调用
 * 将被触摸的部件添加到实体的触摸组件中
 */
const touchCallback = (world: World, id: AnyEntity, part: BasePart) => {
	if (!world.contains(id)) {
		return;
	}
	const currentTouched = world.get(id, Touched);
	if (currentTouched === undefined) {
		world.insert(id, Touched({ entities: [], parts: [part] }));
	} else if (!currentTouched.parts.includes(part)) {
		world.insert(id, currentTouched.patch({ parts: [...currentTouched.parts, part] }));
	}
};

/**
 * 触摸结束回调函数 - 当部件停止触摸时调用
 * 从实体的触摸组件中移除不再触摸的部件
 */
const touchEndCallback = (world: World, id: AnyEntity, part: BasePart) => {
	if (!world.contains(id)) {
		return;
	}
	const currentTouched = world.get(id, Touched);
	if (currentTouched !== undefined) {
		const newParts = currentTouched.parts.filter((entity) => entity !== part);
		world.insert(id, currentTouched.patch({ parts: newParts }));
	}
};

/**
 * 设置触发区域的系统
 * 为具有触发组件的实体设置触摸检测，管理触摸事件的连接和断开
 */
const setupTriggerVolumes = (world: World) => {
	for (const component of TRIGGER_COMPONENTS) {
		for (const [id, value] of world.queryChanged(component)) {
			if (!world.contains(id)) {
				continue;
			}
			if (value.new === undefined) {
				const connected = world.get(id, ConnectedSignals);
				if (connected !== undefined) {
					for (const signal of connected.signals) {
						signal?.Disconnect();
					}
				}
				continue;
			}
			if (value.old === undefined && value.new !== undefined) {
				const renderable = world.get(id, Renderable);
				const model = renderable?.model;
				if (model !== undefined) {
					const signals: RBXScriptConnection[] = [];
					for (const descendant of model.GetDescendants()) {
						if (descendant.IsA("BasePart")) {
							signals.push(
								descendant.Touched.Connect((part) => {
									touchCallback(world, id, part);
								}),
								descendant.TouchEnded.Connect((part) => {
									touchEndCallback(world, id, part);
								}),
							);
						}
					}
					world.insert(id, ConnectedSignals({ signals }));
					model.ChildAdded.Connect((child) => {
						if (child.IsA("BasePart")) {
							const currentSignals = world.get(id, ConnectedSignals);
							const signals: RBXScriptConnection[] = [];
							signals.push(
								child.Touched.Connect((part) => {
									touchCallback(world, id, part);
								}),
								child.TouchEnded.Connect((part) => {
									touchEndCallback(world, id, part);
								}),
							);
							if (currentSignals !== undefined) {
								world.insert(
									id,
									currentSignals.patch({ signals: [...currentSignals.signals, ...signals] }),
								);
							} else {
								world.insert(id, ConnectedSignals({ signals }));
							}
						}
					});
				}
			}
		}
	}
	for (const [id, touched] of world.query(Touched)) {
		const entities: AnyEntity[] = [];
		for (const part of touched.parts) {
			const parentModel = part.FindFirstAncestorWhichIsA("Model");
			const entityId = parentModel?.GetAttribute(entityKey) as AnyEntity;
			if (entityId === undefined) {
				continue;
			}
			if (!entities.includes(entityId)) {
				entities.push(entityId);
			}
		}
		world.insert(id, touched.patch({ entities }));
	}
};

export = {
	system: setupTriggerVolumes,
};
