/** 军团阵营枚举 */
export enum SquadFaction {
	/** 玩家阵营 */
	Player,
	/** 敌军阵营 */
	Enemy,
	/** 中立阵营 */
	Neutral,
}

/** 军团阵型枚举 */
export enum SquadFormation {
	/** 方阵 */
	Square,
	/** 圆形 */
	Circle,
	/** 楔形 */
	Wedge,
	/** 横排 */
	Line,
	/** 散乱 */
	Scattered,
}

/** 士兵动画状态枚举 */
export enum SoldierAnimationState {
	/** 闲置 */
	Idle,
	/** 移动 */
	Moving,
	/** 攻击 */
	Attacking,
	/** 死亡 */
	Dying,
	/** 逃跑 */
	Fleeing,
}

/** 军团状态枚举 */
export enum SquadState {
	/** 待命 */
	Idle,
	/** 移动中 */
	Moving,
	/** 战斗中 */
	Fighting,
	/** 撤退中 */
	Retreating,
	/** 溃散 */
	Routed,
}

/**
 * 将军团状态转换为字符串描述
 * @param state - 军团状态枚举值
 * @returns 状态的字符串表示
 */
export const translateSquadState = (state: SquadState) => {
	const names = ["Idle", "Moving", "Fighting", "Retreating", "Routed"];
	return names[state];
};

/**
 * 将阵营转换为字符串描述
 * @param faction - 阵营枚举值
 * @returns 阵营的字符串表示
 */
export const translateSquadFaction = (faction: SquadFaction) => {
	const names = ["Player", "Enemy", "Neutral"];
	return names[faction];
};