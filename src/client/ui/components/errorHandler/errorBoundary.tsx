import React, { Component, ErrorInfo, ReactComponent } from "@rbxts/react";

/** 错误边界组件属性接口 */
interface ErrorBoundaryProps {
	fallback: (error: unknown) => React.Element;
}

/** 错误边界组件状态接口 */
interface ErrorBoundaryState {
	hasError: boolean;
	message?: unknown;
}

/** 错误边界组件，用于捕获和处理 React 组件树中的错误 */
@ReactComponent
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	public state: ErrorBoundaryState = {
		hasError: false,
	};

	public componentDidCatch(message: unknown, info: ErrorInfo) {
		warn(message, info.componentStack);

		this.setState({
			hasError: true,
			message: `${message} ${info.componentStack}`,
		});
	}

	public render() {
		if (this.state.hasError) {
			return this.props.fallback(this.state.message);
		} else {
			return this.props.children;
		}
	}
}
