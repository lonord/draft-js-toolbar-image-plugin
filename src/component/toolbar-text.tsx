import * as React from 'react'
import {
	ToolbarText as StyledToolbarText,
	ToolbarTextComponentClass,
	ToolbarTextWrapper,
	ToolbarTextWrapperComponentClass
} from './styled'

export interface ToolbarTextProps {
	text: string
	theme?: { wrapper: string, text: string }
	wrapperComponent?: ToolbarTextWrapperComponentClass
	textComponent?: ToolbarTextComponentClass
}

export default class ToolbarText extends React.Component<ToolbarTextProps, any> {
	render() {
		const { wrapperComponent, textComponent, text, theme } = this.props
		const WrapperComp = wrapperComponent || ToolbarTextWrapper
		const TextComp = textComponent || StyledToolbarText
		return theme
			? <div className={theme.wrapper}>
				<span className={theme.text}>{text}</span>
			</div>
			: <WrapperComp>
				<TextComp>{text}</TextComp>
			</WrapperComp>
	}
}
