import { combineProducers, InferState } from "@rbxts/reflex";
import { useProducer, UseProducerHook } from "@rbxts/react-reflex";

import { appSlice } from "./app";
import { playerSlice } from "./player";

/** 根存储类型定义 */
export type RootStore = typeof store;

/** 根状态类型定义 */
export type RootState = InferState<RootStore>;

/**
 * 创建根状态管理存储
 * 组合应用和玩家的状态切片
 * @returns 组合后的存储实例
 */
export function createStore() {
	const store = combineProducers({
		app: appSlice,
		player: playerSlice,
	});

	return store;
}

/** 全局存储实例 */
export const store = createStore();

/** React Hook，用于在组件中使用存储 */
export const useStore: UseProducerHook<RootStore> = useProducer;
