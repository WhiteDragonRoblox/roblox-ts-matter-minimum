import { config, SpringOptions } from "@rbxts/ripple";

/** 弹簧动画配置常量，定义不同类型的动画效果 */
export const springs = {
	...config.spring,
	bubbly: { tension: 400, friction: 14 },
	responsive: { tension: 400 },
	gentle: { tension: 250, friction: 30 },
	world: { tension: 180, friction: 30 },
} satisfies { [config: string]: SpringOptions };
