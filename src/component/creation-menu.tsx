import { EditorState } from 'draft-js'
import * as React from 'react'
import addImage from '../util/add-image'
import readImage from '../util/image-reader'
import { UploadManager } from '../util/upload-manager'
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
	supportUpload?: boolean
	acceptImageFiles?(files: File[]): boolean | string
	uploadManager?: UploadManager
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
		const { acceptImageFiles, getEditorState, setEditorState, uploadManager } = this.props
		if (acceptImageFiles) {
			const result = acceptImageFiles(files)
			if (result !== true) {
				// TODO 提示错误信息
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
			wrapperComponent,
			inputComponent,
			separatorClass,
			acceptImageFiles,
			supportUpload, ...rest } = this.props
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
				{supportUpload ?
					separatorClass
						? <div className={separatorClass} />
						: <Separator />
					: null}
				{supportUpload
					? <UploadButton {...rest} onFileUpload={this.handleUpload} />
					: null}
			</span>
		)
	}
}
