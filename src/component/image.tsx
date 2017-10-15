import { ContentBlock, ContentState, EditorState } from 'draft-js'
import * as React from 'react'
import { DashLoading } from 'respinner'
import unionClassNames from 'union-class-names'
import validateCSSSize from '../util/css-size-validator'
import { removeImageData, updateImageData } from '../util/image-selection-util'
import { UploadManager, UploadStatus, UploadTask } from '../util/upload-manager'
import { CornerIconWrapper, Image as StyledImage, InlineBlock, OpacityAnimationWrapper } from './styled'
import { WrongIcon } from './svg'

export interface ImageProps {
	block?: ContentBlock
	contentState?: ContentState
	className?: string
	blockProps?: any
	theme?: { image: string, imageFocus: string }
	customStyleMap
	customStyleFn
	decorator
	forceSelection
	offsetKey
	selection
	tree

	uploadManager?: UploadManager
	setEditorState?(editorState: EditorState)
	getEditorState?(): EditorState
}

interface ImageState {
	uploadStatus: 'uploading' | 'succeed' | 'failed' | 'none'
}

export default class Image extends React.Component<ImageProps, ImageState> {

	state: ImageState = {
		uploadStatus: 'none'
	}

	uploadTask: UploadTask = null

	updateImageEntity = (task: UploadTask) => {
		const { setEditorState, getEditorState, block } = this.props
		if (setEditorState && getEditorState) {
			const editorState = getEditorState()
			let newContentState = updateImageData(editorState.getCurrentContent(), block, {
				insertType: 'upload.select',
				src: task.getFileUrl()
			})
			newContentState = removeImageData(newContentState, block, 'fileId')
			setEditorState(EditorState.push(getEditorState(), newContentState, 'apply-entity'))
		}
	}

	handleImageClick = (e: React.SyntheticEvent<HTMLImageElement>) => {
		e.preventDefault()
		const { blockProps } = this.props
		if (!(blockProps.isFocused && blockProps.isFocused())) {
			blockProps.onClick(e)
		}
	}

	handleUploadStatusChange = (status: UploadStatus) => {
		this.setState({
			uploadStatus: status
		})
		if (status === 'succeed' && this.uploadTask) {
			this.updateImageEntity(this.uploadTask)
			this.uploadTask.offStatusChange(this.handleUploadStatusChange)
			this.uploadTask = null
		}
	}

	componentWillUnmount() {
		if (this.uploadTask) {
			this.uploadTask.offStatusChange(this.handleUploadStatusChange)
			this.uploadTask = null
		}
	}

	componentDidMount() {
		const { block, getEditorState, uploadManager } = this.props
		if (block && getEditorState && uploadManager) {
			const { insertType, fileId } = getEditorState().getCurrentContent().getEntity(block.getEntityAt(0)).getData()
			if (insertType === 'shortcut' && fileId) {
				const task = uploadManager.getTask(fileId)
				if (task) {
					const status = task.getStatus()
					if (status !== 'succeed') {
						task.onStatusChange(this.handleUploadStatusChange)
						this.setState({
							uploadStatus: status
						})
						this.uploadTask = task
					} else {
						this.updateImageEntity(task)
					}
				}
			}
		}
	}

	render() {
		const {
			block,
			className,
			theme,
			setEditorState,
			getEditorState,
			...otherProps
		} = this.props
		// leveraging destructuring to omit certain properties from props
		const {
			blockProps,
			customStyleMap,
			customStyleFn,
			decorator,
			forceSelection,
			offsetKey,
			selection,
			tree,
			contentState,
			...elementProps
		} = otherProps
		const { uploadStatus } = this.state
		const { src, width, alignment } = getEditorState().getCurrentContent().getEntity(block.getEntityAt(0)).getData()
		const wrapperStyle: any = {}
		const imageStyle: any = {}
		if (width) {
			const result = validateCSSSize(width)
			if (result) {
				imageStyle.width = result
			}
		}
		if (alignment === 'center') {
			wrapperStyle.textAlign = 'center'
		}
		if (theme) {
			const combinedClassName = blockProps && blockProps.isFocused && blockProps.isFocused()
				? unionClassNames(theme && theme.image, theme && theme.imageFocus, className)
				: unionClassNames(theme && theme.image, className)
			return (
				<div style={wrapperStyle}>
					<InlineBlock>
						<CornerIconWrapper>
							{uploadStatus === 'uploading'
								? <DashLoading size={24} stroke="#4197ff" strokeWidth={3} />
								: null}
							{uploadStatus === 'failed'
								? <WrongIcon color="#d93a22" />
								: null}
						</CornerIconWrapper>
						<OpacityAnimationWrapper
							isPlay={uploadStatus === 'uploading'}
							isSemitransparent={uploadStatus === 'failed'}>
							<img
								{...elementProps}
								style={imageStyle}
								onClick={this.handleImageClick}
								src={src}
								role="presentation"
								className={combinedClassName}
							/>
						</OpacityAnimationWrapper>
					</InlineBlock>
				</div>
			)
		} else {
			return (
				<div style={wrapperStyle}>
					<InlineBlock>
						<CornerIconWrapper>
							{uploadStatus === 'uploading'
								? <DashLoading size={24} stroke="#4197ff" strokeWidth={3} />
								: null}
							{uploadStatus === 'failed'
								? <WrongIcon color="#d93a22" />
								: null}
						</CornerIconWrapper>
						<OpacityAnimationWrapper
							isPlay={uploadStatus === 'uploading'}
							isSemitransparent={uploadStatus === 'failed'}>
							<StyledImage
								{...elementProps}
								style={imageStyle}
								focused={blockProps.isFocused && blockProps.isFocused()}
								onClick={this.handleImageClick}
								src={src}
								role="presentation"
								className={className} />
						</OpacityAnimationWrapper>
					</InlineBlock>
				</div>
			)
		}
	}
}
