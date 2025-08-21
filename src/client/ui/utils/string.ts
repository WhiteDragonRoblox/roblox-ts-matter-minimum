/** 在字符串开头填充指定字符，直到达到目标长度 */
export const padStart = (str: string, targetLength: number, pad: string) => {
	while (str.size() < targetLength) {
		str = pad + str;
	}
	return str;
};
