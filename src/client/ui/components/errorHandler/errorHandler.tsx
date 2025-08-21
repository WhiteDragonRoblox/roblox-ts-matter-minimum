import React from "@rbxts/react";
import { ErrorBoundary } from "./errorBoundary";
import { ErrorPage } from "./errorPage";

/** 错误处理组件属性接口 */
interface ErrorHandlerProps extends React.PropsWithChildren {}

/** 错误处理组件，包装错误边界并提供错误页面 */
export function ErrorHandler({ children }: ErrorHandlerProps) {
	return (
		<ErrorBoundary
			fallback={(message) => {
				return <ErrorPage message={message} />;
			}}
		>
			{children}
		</ErrorBoundary>
	);
}
