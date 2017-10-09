import styled, { StyledComponentClass } from 'styled-components'

export interface ImageProps {
	focused: boolean
}
export const Image = styled.img`
	cursor: default;
	${(props: ImageProps) => props.focused ? `
		border-radius: 2px;
		box-shadow: 0 0 5px 2px #ACCEF7;
		transition: border linear 0.2s, box-shadow linear 0.2s;
	` : ''}
`

export const ItemButton = styled.button`
	${props => props.disabled
		? `
			cursor: not-allowed;
			opacity: 0.5;
		`
		: ''}
`

export type ToolbarInputComponentClass = StyledComponentClass<React.HTMLProps<HTMLInputElement>, any>
export const ToolbarInput = styled.input`
	outline: none;
	vertical-align: text-bottom;
	height: 34px;
	width: 250px;
	padding: 0px 5px;
	border: none;
	background: #f0f0f0;
	&::-webkit-input-placeholder {
		color: #b0b0b0;
	}
	&:-moz-placeholder {
		color: #b0b0b0;
	}
	&::-moz-placeholder {
		color: #b0b0b0;
	}
	&:-ms-input-placeholder {
		color: #b0b0b0;
	}
` as ToolbarInputComponentClass

export const SmallToolbarInput = ToolbarInput.extend`
	width: 50px;
`

export type ToolbarInputWrapperComponentClass = StyledComponentClass<any, any>
export const ToolbarInputWrapper = styled.div`
	display: inline-block;
` as ToolbarInputWrapperComponentClass

export const Separator = styled.div`
	display: inline-block;
	border-right: 1px solid #ddd;
	height: 24px;
	margin: 0 0.5em;
`

export const IconWrapper = styled.span`
	display: inline-block;
	padding: 5px 6px 3px;
	text-align: center;
	box-sizing: border-box;
`

export const InvisibleInput = styled.input`
	position: absolute;
	width: 0;
	height: 0;
	left: -10000px;
	top: -10000px;
	opacity: 0;
`
