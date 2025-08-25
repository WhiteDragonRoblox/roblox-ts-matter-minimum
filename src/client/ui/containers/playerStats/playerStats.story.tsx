import "client/ui/app/react-config";

import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { PlayerStats } from "./playerStats";
import { CreateReactStory, Slider } from "@rbxts/ui-labs";
import { RootProvider } from "client/ui/providers/rootProvider";

const controls = {
	sizeX: Slider(100, 100, 1000),
	sizeY: Slider(100, 100, 1000),
	title: "Hello World",
};

const story = CreateReactStory(
	{
		controls,
		react: React,
		reactRoblox: ReactRoblox,
	},
	(props) => (
		<RootProvider>
			<PlayerStats key="player-stats" />
		</RootProvider>
	),
);

export = story;
