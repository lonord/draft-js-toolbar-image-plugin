import debug from 'debug'
import * as React from 'react'
import createToolbarButton from '../util/toolbar-button-creator'
import { CheckIcon, ImageIcon, UploadIcon } from './svg'

const d = debug('draft-js-toolbar-image-plugin:toolbar-buttons')

const ImageToolbarButton = createToolbarButton({
	children: <ImageIcon />
})

export interface ImageTriggerButtonProps {
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

export const UploadButton = createToolbarButton({
	children: <UploadIcon />
})
