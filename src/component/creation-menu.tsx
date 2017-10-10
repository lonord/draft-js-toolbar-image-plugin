import { EditorState } from 'draft-js'
import * as React from 'react'
import addImage from '../util/add-image'
import { Separator, ToolbarInputComponentClass, ToolbarInputWrapperComponentClass } from './styled'
import { CheckButton, UploadButton } from './toolbar-buttons'
import ToolbarInput from './toolbar-input'

export interface CreationMenuProps {
	setEditorState?(editorState: EditorState)
	getEditorState?(): EditorState
	onPickerClose?()
	requestEditorFocus?()
	inputPlaceholder?: string
	inputTheme?: { wrapper: string, input: string }
	wrapperComponent?: ToolbarInputWrapperComponentClass
	inputComponent?: ToolbarInputComponentClass
	separatorClass?: string
}

export default class CreationMenu extends React.Component<CreationMenuProps, any> {

	state = {
		inputValue: ''
	}

	handleInputChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
		this.setState({
			inputValue: e.currentTarget.value
		})
	}

	handleCheckClick = () => {
		const { onPickerClose, setEditorState, getEditorState, requestEditorFocus } = this.props
		if (setEditorState && getEditorState) {
			setEditorState(addImage(getEditorState(), this.state.inputValue))
		}
		onPickerClose && onPickerClose()
		setTimeout(() => requestEditorFocus && requestEditorFocus(), 100)
	}

	handleUpload = (files: File[]) => {
		// TODO
		console.log(files)
	}

	handleKeyboardInputDismiss = () => {
		const { onPickerClose, requestEditorFocus } = this.props
		onPickerClose && onPickerClose()
		requestEditorFocus && requestEditorFocus()
	}

	render() {
		const { inputTheme, inputPlaceholder, wrapperComponent, inputComponent, separatorClass, ...rest } = this.props
		return (
			<span>
				<ToolbarInput
					value={this.state.inputValue}
					onChange={this.handleInputChange}
					onConfirm={this.handleCheckClick}
					onDismiss={this.handleKeyboardInputDismiss}
					placeholder={inputPlaceholder}
					theme={inputTheme}
					wrapperComponent={wrapperComponent}
					inputComponent={inputComponent}
					autoFocus={true}/>
				<CheckButton isDisabled={!this.state.inputValue} onClick={this.handleCheckClick} {...rest} />
				{separatorClass
					? <div className={separatorClass} />
					: <Separator />}
				<UploadButton {...rest} onFileUpload={this.handleUpload} />
			</span>
		)
	}
}
