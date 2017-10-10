import * as React from 'react'
import { ToolbarInput as StyledToolbarInput, ToolbarInputComponentClass, ToolbarInputWrapper, ToolbarInputWrapperComponentClass } from './styled'

export interface ToolbarInputProps {
	onChange(event: React.SyntheticEvent<HTMLInputElement>)
	onConfirm?()
	onDismiss?()
	value: string
	placeholder?: string
	theme?: { wrapper: string, input: string }
	wrapperComponent?: ToolbarInputWrapperComponentClass
	inputComponent?: ToolbarInputComponentClass
	autoFocus?: boolean
}

export default class ToolbarInput extends React.Component<ToolbarInputProps, any> {

	editor: HTMLInputElement

	handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const { onConfirm, onDismiss, value } = this.props
		if (e.keyCode === 13 && onConfirm && value) {
			e.preventDefault()
			e.stopPropagation()
			onConfirm()
		} else if (e.keyCode === 27 && onDismiss) {
			e.preventDefault()
			e.stopPropagation()
			onDismiss()
		}
	}

	componentDidMount() {
		const { autoFocus } = this.props
		if (autoFocus) {
			setTimeout(() => this.editor && this.editor.focus(), 100)
		}
	}

	render() {
		const { onChange, value, placeholder, theme, wrapperComponent, inputComponent } = this.props
		const URLInputWrapperComp = wrapperComponent || ToolbarInputWrapper
		const URLInputComp = inputComponent || StyledToolbarInput
		const plactholderText = placeholder || 'Input image url ...'
		return theme
			? <div className={theme.wrapper}>
				<input ref={ref => this.editor = ref}
					className={theme.input}
					onKeyDown={this.handleKeyDown}
					onChange={onChange}
					value={value}
					placeholder={plactholderText} />
			</div>
			: <URLInputWrapperComp>
				<URLInputComp
					innerRef={ref => this.editor = ref}
					onKeyDown={this.handleKeyDown}
					onChange={onChange}
					value={value}
					placeholder={plactholderText} />
			</URLInputWrapperComp>
	}
}
