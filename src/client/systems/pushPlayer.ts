import { World } from "@rbxts/matter";
import { LocalClient, PlayerModel, ReceiveForce } from "shared/components";

/** 对本地玩家施加力的推动效果 */
const pushPlayer = (world: World) => {
	for (const [id, { force }, { character }] of world.query(ReceiveForce, PlayerModel, LocalClient)) {
		const primaryPart = character?.PrimaryPart;
		if (primaryPart === undefined) {
			continue;
		}
		primaryPart.ApplyImpulse(force);
		world.remove(id, ReceiveForce);
	}
};

export = {
	system: pushPlayer,
};
