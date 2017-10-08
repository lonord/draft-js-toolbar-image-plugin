import * as React from 'react'
import { ItemButton } from '../component/styled'

export interface ToolbarButtonProps {
	theme?: any
	onClick?(e: React.SyntheticEvent<HTMLButtonElement>)
	isDisabled?: boolean
}

export default ({ children }) => (
	class ToolbarButton extends React.Component<ToolbarButtonProps, any> {

		preventBubblingUp = (event) => { event.preventDefault() }

		handleClick = e => {
			const { onClick } = this.props
			onClick && onClick(e)
		}

		render() {
			const { theme, isDisabled } = this.props
			return (
				<div className={theme.buttonWrapper} onMouseDown={this.preventBubblingUp}>
					<ItemButton
						className={theme.button}
						onClick={this.handleClick}
						disabled={!!isDisabled}
						type="button"
						children={children} />
				</div>
			)
		}
	}
)
