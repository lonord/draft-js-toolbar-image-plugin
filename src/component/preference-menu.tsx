import decorateComponentWithProps from 'decorate-component-with-props'
import { EditorState, EntityInstance } from 'draft-js'
import {
	AlignBlockCenterButton,
	AlignBlockDefaultButton
} from 'draft-js-buttons'
import * as debounce from 'lodash.debounce'
import * as React from 'react'
import { getImageEntity, getImageEntityKey, removeSelectedImageData, updateSelectedImageData } from '../util/image-selection-util'
import { UploadManager, UploadStatus, UploadTask } from '../util/upload-manager'
import {
	IconWrapper,
	Separator,
	SmallToolbarInput,
	ToolbarInputComponentClass,
	ToolbarInputWrapperComponentClass,
	ToolbarTextComponentClass,
	ToolbarTextWrapperComponentClass
} from './styled'
import { ResizeIcon } from './svg'
import { RetryButton } from './toolbar-buttons'
import ToolbarInput from './toolbar-input'
import ToolbarText from './toolbar-text'

export interface PreferenceMenuProps {
	onOverrideContent?(comp: React.ComponentClass<any>): void
	shouldForceShowPreference?(): boolean
	setEditorState?(editorState: EditorState)
	getEditorState?(): EditorState
	inputPlaceholder?: string
	inputTheme?: { wrapper: string, input: string }
	inputWrapperComponent?: ToolbarInputWrapperComponentClass
	inputComponent?: ToolbarInputComponentClass
	separatorClass?: string
	theme?: { button: string, buttonWrapper: string }
	textTheme?: { text: string, wrapper: string }
	textWrapperComponent?: ToolbarTextWrapperComponentClass
	textComponent?: ToolbarTextComponentClass
	uploadManager?: UploadManager
}

interface PreferenceMenuState {
	inputValue: string
	alignment: string
	uploadStatus: 'uploading' | 'succeed' | 'failed' | 'none'
	errorMessage: string
}

export default class PreferenceMenu extends React.Component<PreferenceMenuProps, PreferenceMenuState> {

	state: PreferenceMenuState = {
		inputValue: '',
		alignment: '',
		uploadStatus: 'none',
		errorMessage: null
	}

	currentEntityKey = ''
	uploadTask: UploadTask = null

	applyEntityData = (entity: EntityInstance) => {
		const { uploadManager } = this.props
		const { width, alignment, fileId } = entity.getData()
		this.setState({
			inputValue: width || '',
			alignment: alignment === 'center' ? alignment : 'default',
			uploadStatus: 'none',
			errorMessage: null
		})
		this.removeTaskListener()
		if (fileId && uploadManager) {
			const task = uploadManager.getTask(fileId)
			if (task) {
				this.uploadTask = task
				this.handleUploadStatusChange(task.getStatus())
				task.onStatusChange(this.handleUploadStatusChange)
			}
		}
	}

	removeTaskListener = () => {
		if (this.uploadTask) {
			this.uploadTask.offStatusChange(this.handleUploadStatusChange)
			this.uploadTask = null
		}
	}

	handleInputChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
		this.setState({
			inputValue: e.currentTarget.value
		})
		this.applySize()
	}

	applySize = debounce(() => {
		const { getEditorState, setEditorState } = this.props
		if (getEditorState && setEditorState) {
			const newSize = this.state.inputValue
			if (newSize.toUpperCase() === 'AUTO' || newSize.trim() === '') {
				setEditorState(removeSelectedImageData(getEditorState(), 'width'))
			} else {
				setEditorState(updateSelectedImageData(getEditorState(), {
					width: newSize
				}))
			}
		}
	}, 300)

	handleChangeAlignment = (alignment: string) => {
		const { getEditorState, setEditorState } = this.props
		if (getEditorState && setEditorState) {
			if (alignment === 'center') {
				setEditorState(updateSelectedImageData(getEditorState(), {
					alignment
				}))
			} else {
				setEditorState(removeSelectedImageData(getEditorState(), 'alignment'))
			}
			this.setState({
				alignment: alignment === 'center' ? alignment : 'default'
			})
		}
	}

	handleUploadStatusChange = (status: UploadStatus) => {
		this.setState({
			uploadStatus: status
		})
		if (status === 'failed' && this.uploadTask) {
			this.setState({
				errorMessage: this.uploadTask.getErrorMessage()
			})
		}
	}

	handleRetryUpload = () => {
		this.uploadTask && this.uploadTask.retry()
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
					this.applyEntityData(entity)
					this.currentEntityKey = key
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
				this.applyEntityData(entity)
			}
		}
	}

	componentWillUnmount() {
		this.removeTaskListener()
	}

	render() {
		const {
			inputTheme,
			inputPlaceholder,
			inputWrapperComponent,
			inputComponent,
			separatorClass,
			textTheme,
			textWrapperComponent,
			textComponent,
			...rest } = this.props
		const theme = rest.theme || {} as any
		const { alignment, errorMessage, uploadStatus, inputValue } = this.state
		return (
			<span onClick={e => e.stopPropagation()}>
				<AlignBlockDefaultButton theme={theme} alignment={alignment}
					setAlignment={({ alignment }) => this.handleChangeAlignment(alignment)} />
				<AlignBlockCenterButton theme={theme} alignment={alignment}
					setAlignment={({ alignment }) => this.handleChangeAlignment(alignment)} />
				{separatorClass
					? <div className={separatorClass} />
					: <Separator />}
				<div className={theme.buttonWrapper}>
					<IconWrapper className={theme.button}>
						<ResizeIcon/>
					</IconWrapper>
				</div>
				<ToolbarInput
					value={inputValue}
					onChange={this.handleInputChange}
					placeholder={inputPlaceholder || 'auto'}
					theme={inputTheme}
					wrapperComponent={inputWrapperComponent}
					inputComponent={inputComponent || SmallToolbarInput} />
				{uploadStatus === 'failed'
					? separatorClass
						? <div className={separatorClass} />
						: <Separator />
					: null}
				{uploadStatus === 'failed'
					? <RetryButton theme={theme} onClick={this.handleRetryUpload}/>
					: null}
				{uploadStatus === 'failed' && errorMessage
					? <ToolbarText text={errorMessage}
						theme={textTheme}
						textComponent={textComponent}
						wrapperComponent={textWrapperComponent}/>
					: null}
			</span>
		)
	}
}
