import { AnySave, CurrentPlayerSave, CurrentSaveVersion, PlayerSaveV1 } from "../constants/playerSave";

/** 迁移旧版本的玩家存档到当前版本 */
export const migratePlayerSave = (playerSave: AnySave): CurrentPlayerSave => {
	const currentSave: AnySave = playerSave;
	playerSave.version = CurrentSaveVersion;
	return currentSave as CurrentPlayerSave;
};
