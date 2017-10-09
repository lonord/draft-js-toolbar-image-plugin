import debug from 'debug'
import * as React from 'react'
import createToolbarButton, { ToolbarButtonProps } from '../util/toolbar-button-creator'
import { InvisibleInput } from './styled'
import { CheckIcon, ImageIcon, UploadIcon } from './svg'

const d = debug('draft-js-toolbar-image-plugin:toolbar-buttons')

const ImageToolbarButton = createToolbarButton({
	children: <ImageIcon />
})

const UploadToolbarButton = createToolbarButton({
	children: <UploadIcon />
})

export interface ImageTriggerButtonProps extends ToolbarButtonProps {
	shouldForceShowPreference?(): boolean
	preferenceMenuComponent?: React.ComponentClass<any>
	onOverrideContent?(comp: React.ComponentClass<any>): void
}

export class ImageTriggerButton extends React.Component<ImageTriggerButtonProps, any> {

	showPreference = false

	componentDidUpdate(prevProps: ImageTriggerButtonProps) {
		d('component did update')
		const { shouldForceShowPreference, onOverrideContent, preferenceMenuComponent } = this.props
		const showPreference = shouldForceShowPreference && shouldForceShowPreference()
		if (!this.showPreference && showPreference) {
			d('show preference menu component')
			onOverrideContent && preferenceMenuComponent && onOverrideContent(preferenceMenuComponent)
		}
		this.showPreference = showPreference
	}

	componentDidMount() {
		const { shouldForceShowPreference, onOverrideContent, preferenceMenuComponent } = this.props
		this.showPreference = shouldForceShowPreference && shouldForceShowPreference()
		if (this.showPreference && onOverrideContent && preferenceMenuComponent) {
			onOverrideContent(preferenceMenuComponent)
		}
	}

	render() {
		const { shouldForceShowPreference, preferenceMenuComponent, ...rest } = this.props
		return <ImageToolbarButton {...rest} />
	}
}

export const CheckButton = createToolbarButton({
	children: <CheckIcon />
})

export interface UploadButtonProps extends ToolbarButtonProps {
	onFileUpload(files: File[])
}

export class UploadButton extends React.Component<UploadButtonProps, any> {

	fileInput: HTMLInputElement = null

	handleInputChange = (e) => {
		const files: File[] = []
		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < this.fileInput.files.length; i++) {
			files.push(this.fileInput.files[i])
		}
		const { onFileUpload } = this.props
		onFileUpload && onFileUpload(files)
	}

	handleButtonClick = () => {
		if (this.fileInput) {
			this.fileInput.focus()
			this.fileInput.click()
		}
	}

	render() {
		const { onFileUpload, ...rest } = this.props
		return (
			<span>
				<UploadToolbarButton {...rest} onClick={this.handleButtonClick} />
				<InvisibleInput innerRef={ref => this.fileInput = ref}
					type="file" accept="image/*" multiple onChange={this.handleInputChange} />
			</span>
		)
	}
}
