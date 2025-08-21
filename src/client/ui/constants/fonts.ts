/** 字体库定义，包含 Inter 和 Roboto Mono 字体的不同字重 */
export const fonts = {
	inter: {
		regular: new Font("rbxassetid://12187365364"),
		medium: new Font("rbxassetid://12187365364", Enum.FontWeight.Medium),
		bold: new Font("rbxassetid://12187365364", Enum.FontWeight.Bold),
	},
	robotoMono: {
		regular: Font.fromEnum(Enum.Font.RobotoMono),
	},
};
