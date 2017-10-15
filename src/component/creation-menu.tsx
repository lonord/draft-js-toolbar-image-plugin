import { EditorState } from 'draft-js'
import * as React from 'react'
import addImage from '../util/add-image'
import readImage from '../util/image-reader'
import { UploadManager } from '../util/upload-manager'
import {
	Separator,
	ToolbarInputComponentClass,
	ToolbarInputWrapperComponentClass,
	ToolbarTextComponentClass,
	ToolbarTextWrapperComponentClass
} from './styled'
import { CheckButton, UploadButton } from './toolbar-buttons'
import ToolbarInput from './toolbar-input'
import ToolbarText from './toolbar-text'

export interface CreationMenuProps {
	setEditorState?(editorState: EditorState)
	getEditorState?(): EditorState
	onPickerClose?()
	requestEditorFocus?()
	inputPlaceholder?: string
	inputTheme?: { wrapper: string, input: string }
	inputWrapperComponent?: ToolbarInputWrapperComponentClass
	inputComponent?: ToolbarInputComponentClass
	separatorClass?: string
	textTheme?: { text: string, wrapper: string }
	textWrapperComponent?: ToolbarTextWrapperComponentClass
	textComponent?: ToolbarTextComponentClass
	acceptImageFiles?(files: File[]): boolean | string | Error
	uploadManager?: UploadManager
}

interface CreationMenuState {
	inputValue: string
	errorMessage: string
}

export default class CreationMenu extends React.Component<CreationMenuProps, CreationMenuState> {

	state: CreationMenuState = {
		inputValue: '',
		errorMessage: null
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
		const { acceptImageFiles, getEditorState, setEditorState, uploadManager } = this.props
		if (acceptImageFiles) {
			const result = acceptImageFiles(files)
			if (result !== true) {
				if (result) {
					this.setState({
						errorMessage: (result instanceof Error) ? result.message : result
					})
				}
				return
			}
		}
		if (getEditorState && setEditorState && uploadManager) {
			readImage(files).then(fileObjs => {
				fileObjs.forEach(obj => uploadManager.addTask(obj.id, obj.file))
				setEditorState(fileObjs.reduce<EditorState>((editorState, fileObj) => {
					return addImage(editorState, fileObj.url, {
						insertType: 'shortcut',
						fileId: fileObj.id
					})
				}, getEditorState()))
			})
		}
	}

	handleKeyboardInputDismiss = () => {
		const { onPickerClose, requestEditorFocus } = this.props
		onPickerClose && onPickerClose()
		requestEditorFocus && requestEditorFocus()
	}

	render() {
		const {
			inputTheme,
			inputPlaceholder,
			inputWrapperComponent,
			inputComponent,
			separatorClass,
			acceptImageFiles,
			uploadManager,
			textTheme,
			textWrapperComponent,
			textComponent,
			...rest } = this.props
		const { inputValue, errorMessage } = this.state
		return (
			<span>
				<ToolbarInput
					value={this.state.inputValue}
					onChange={this.handleInputChange}
					onConfirm={this.handleCheckClick}
					onDismiss={this.handleKeyboardInputDismiss}
					placeholder={inputPlaceholder}
					theme={inputTheme}
					wrapperComponent={inputWrapperComponent}
					inputComponent={inputComponent}
					autoFocus={true}/>
				<CheckButton isDisabled={!inputValue} onClick={this.handleCheckClick} {...rest} />
				{uploadManager ?
					separatorClass
						? <div className={separatorClass} />
						: <Separator />
					: null}
				{uploadManager
					? <UploadButton {...rest} onFileUpload={this.handleUpload} />
					: null}
				{errorMessage
					? <ToolbarText text={errorMessage}
						theme={textTheme}
						textComponent={textComponent}
						wrapperComponent={textWrapperComponent} />
					: null}
			</span>
		)
	}
}
