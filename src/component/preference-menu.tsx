import decorateComponentWithProps from 'decorate-component-with-props'
import { EditorState } from 'draft-js'
import {
	AlignBlockCenterButton,
	AlignBlockDefaultButton
} from 'draft-js-buttons'
import * as debounce from 'lodash.debounce'
import * as React from 'react'
import { getImageEntity, getImageEntityKey, updateImageData } from '../util/image-selection-util'
import {
	IconWrapper,
	Separator,
	SmallToolbarInput,
	ToolbarInputComponentClass,
	ToolbarInputWrapperComponentClass
} from './styled'
import { ResizeIcon } from './svg'
import ToolbarInput from './toolbar-input'

export interface PreferenceMenuProps {
	onOverrideContent?(comp: React.ComponentClass<any>): void
	shouldForceShowPreference?(): boolean
	setEditorState?(editorState: EditorState)
	getEditorState?(): EditorState
	inputPlaceholder?: string
	inputTheme?: { wrapper: string, input: string }
	wrapperComponent?: ToolbarInputWrapperComponentClass
	inputComponent?: ToolbarInputComponentClass
	separatorClass?: string
	theme?: { button: string, buttonWrapper: string }
}

export default class PreferenceMenu extends React.Component<PreferenceMenuProps, any> {

	state = {
		inputValue: '',
		alignment: ''
	}

	currentEntityKey = ''

	handleInputChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
		this.setState({
			inputValue: e.currentTarget.value
		})
		this.applySize()
	}

	applySize = debounce(() => {
		const { getEditorState, setEditorState } = this.props
		if (getEditorState && setEditorState) {
			let newSize = this.state.inputValue
			if (newSize.toUpperCase() === 'AUTO' || newSize.trim() === '') {
				newSize = undefined
			}
			setEditorState(updateImageData(getEditorState(), {
				width: newSize
			}))
		}
	}, 500)

	handleChangeAlignment = (alignment: string) => {
		const { getEditorState, setEditorState } = this.props
		if (getEditorState && setEditorState) {
			setEditorState(updateImageData(getEditorState(), {
				alignment
			}))
		}
	}

	componentDidUpdate(prevProps: PreferenceMenuProps) {
		const { onOverrideContent, shouldForceShowPreference, getEditorState } = this.props
		if (shouldForceShowPreference) {
			const showPreference = shouldForceShowPreference()
			if (!showPreference) {
				onOverrideContent && onOverrideContent(null)
			}
		}
		if (getEditorState) {
			const editorState = getEditorState()
			const entity = getImageEntity(editorState)
			if (entity) {
				const key = getImageEntityKey(editorState)
				if (key !== this.currentEntityKey) {
					const { width, alignment } = entity.getData()
					this.setState({
						inputValue: width || '',
						alignment
					})
				}
			}
		}
	}

	componentDidMount() {
		const { getEditorState } = this.props
		if (getEditorState) {
			const editorState = getEditorState()
			const entity = getImageEntity(editorState)
			if (entity) {
				this.currentEntityKey = getImageEntityKey(editorState)
				const { width, alignment } = entity.getData()
				this.setState({
					inputValue: width || '',
					alignment
				})
			}
		}
	}

	render() {
		const { inputTheme, inputPlaceholder, wrapperComponent, inputComponent, separatorClass, ...rest } = this.props
		const theme = rest.theme || {} as any
		const { alignment } = this.state
		return (
			<span onClick={e => e.stopPropagation()}>
				<AlignBlockDefaultButton theme={theme} alignment={alignment}
					setAlignment={() => this.handleChangeAlignment('default')} />
				<AlignBlockCenterButton theme={theme} alignment={alignment}
					setAlignment={() => this.handleChangeAlignment('center')} />
				{separatorClass
					? <div className={separatorClass} />
					: <Separator />}
				<div className={theme.buttonWrapper}>
					<IconWrapper className={theme.button}>
						<ResizeIcon/>
					</IconWrapper>
				</div>
				<ToolbarInput
					value={this.state.inputValue}
					onChange={this.handleInputChange}
					placeholder={inputPlaceholder || 'auto'}
					theme={inputTheme}
					wrapperComponent={wrapperComponent}
					inputComponent={inputComponent || SmallToolbarInput} />
			</span>
		)
	}
}
