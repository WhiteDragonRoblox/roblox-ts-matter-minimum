import { CurrentPlayerSave } from "../constants/playerSave";

const HttpService = game.GetService("HttpService");
const DataStore = game.GetService("DataStoreService");

/** 异步保存玩家数据到数据存储 */
export const savePlayer = async (playerId: number, save: CurrentPlayerSave) => {
	const PlayerDataStore = DataStore.GetDataStore("Player", `${playerId}`);
	print(`Saving player ${playerId}`, save);
	try {
		save.lastSave = os.time();
		const saveJSON = HttpService.JSONEncode(save);
		await PlayerDataStore.SetAsync("Save", saveJSON);
		print("Saved player", playerId, save);
	} catch (err) {
		print(`Error saving ${playerId}'s store`, err);
	}
};
