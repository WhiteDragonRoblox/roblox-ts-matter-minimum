import { World } from "@rbxts/matter";
import {
	DamageResistance,
	GodMode,
	Health,
	PlayerModel,
	TakeDamage,
	HealthRegen,
	MaxHealth,
	Breakable,
} from "shared/components";
import applyDamage from "./applyDamage";
import applyForce from "./applyForce";
import { calculateResistance } from "shared/utils/damage";

const Workspace = game.GetService("Workspace");

/** 处理生命值系统 - 管理伤害计算、生命值恢复和玩家模型健康状态 */
const processHealth = (world: World) => {
	for (const [id, breakable] of world.queryChanged(Breakable)) {
		if (!world.contains(id) || breakable.new === undefined) {
			continue;
		}
		if (breakable.old === undefined) {
			world.insert(id, Health({ health: breakable.new.health }), MaxHealth({ amount: breakable.new.health }));
		}
	}

	for (const [id, playerModel] of world.queryChanged(PlayerModel)) {
		if (!world.contains(id)) continue;
		if (playerModel.new?.humanoid !== undefined) {
			world.insert(
				id,
				Health({ health: playerModel.new.humanoid.Health }),
				MaxHealth({ amount: 100 }),
				HealthRegen({ regenAmount: 1 }),
			);
		}
	}

	for (const [id, health, { damageType, amount, inflictor }] of world.query(Health, TakeDamage)) {
		const [damageResistances, godMode] = world.get(id, DamageResistance, GodMode);
		if (godMode !== undefined) {
			world.remove(id, TakeDamage);
			continue;
		}
		const currentResistance = calculateResistance(damageResistances!, damageType) ?? 0;
		const damage = math.max(amount * (math.clamp(100 - currentResistance, 0, 100) / 100), 0);
		const currentHealth = math.max(health.health - damage, 0);
		world.insert(id, health.patch({ health: currentHealth }));
		world.remove(id, TakeDamage);
	}

	for (const [id, health, { amount: maxHealth }, { regenAmount, lastTick }] of world.query(
		Health,
		MaxHealth,
		HealthRegen,
	)) {
		if (
			health.health < maxHealth &&
			health.health > 0 &&
			(lastTick === undefined || lastTick + 1 < Workspace.GetServerTimeNow())
		) {
			world.insert(
				id,
				health.patch({ health: health.health + regenAmount }),
				HealthRegen({ lastTick: Workspace.GetServerTimeNow(), regenAmount }),
			);
		}
	}

	for (const [, { humanoid }, { health }] of world.query(PlayerModel, Health)) {
		if (humanoid !== undefined) {
			humanoid.Health = health;
		}
	}
};

/** 导出生命值处理系统，在应用伤害和应用力系统之后执行 */
export = {
	system: processHealth,
	after: [applyDamage, applyForce],
};
