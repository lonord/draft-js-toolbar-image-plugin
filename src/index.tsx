import debug from 'debug'
import decorateComponentWithProps from 'decorate-component-with-props'
import { ContentBlock, Editor, EditorState, SelectionState } from 'draft-js'
import createPicker from 'draft-js-plugin-editor-toolbar-picker'
import * as React from 'react'

import CreationMenu, { CreationMenuProps } from './component/creation-menu'
import ImageComponent from './component/image'
import PreferenceMenu from './component/preference-menu'
import { ToolbarInputComponentClass, ToolbarInputWrapperComponentClass } from './component/styled'
import { ImageTriggerButton } from './component/toolbar-buttons'
import addImage from './util/add-image'
import {
	isImageBlock,
	isImageBlockInSelection,
	selectImageWithBlockKey,
	selectNextBlock,
	selectPrevBlock
} from './util/image-selection-util'
import insertNewLine from './util/insert-new-line'

const d = debug('draft-js-toolbar-image-plugin')

interface PluginFunctions {
	setEditorState(editorState: EditorState)
	getEditorState(): EditorState
	getReadOnly(): boolean
	getEditorRef(): Editor
}

export interface ToolbarImagePluginTheme {
	image?: string
	imageFocus?: string
	input?: string
	inputWrapper?: string
	separator?: string
}

export interface ToolbarImagePluginOptions {
	theme?: ToolbarImagePluginTheme
	imageComponent?: React.ComponentClass
	decorator?<P>(comp: React.ComponentClass<P>): React.ComponentClass<P>
	inputPlaceholder?: string
	inputWrapperComponent?: ToolbarInputWrapperComponentClass
	inputComponent?: ToolbarInputComponentClass
}

export default function createToolbarImagePlugin(options: ToolbarImagePluginOptions = {}) {

	let pluginFunctions: PluginFunctions
	let lastEditorState: EditorState

	let Image = options.imageComponent || ImageComponent
	if (options.decorator) {
		Image = options.decorator(Image)
	}

	const theme = options.theme || {}

	const ThemedImage = decorateComponentWithProps(Image, {
		theme: theme.image || theme.imageFocus ? {
			image: theme.image,
			imageFocus: theme.imageFocus
		} : null
	})

	const shouldForceShowPreference = () => pluginFunctions && isImageBlockInSelection(pluginFunctions.getEditorState())

	const menuDecoratedProps = {
		inputTheme: theme.inputWrapper || theme.input ? {
			wrapper: theme.inputWrapper,
			input: theme.input
		} : null,
		separatorClass: theme.separator,
		inputPlaceholder: options.inputPlaceholder,
		inputComponent: options.inputComponent,
		wrapperComponent: options.inputWrapperComponent,
		requestEditorFocus: () => {
			if (pluginFunctions && pluginFunctions.getEditorRef) {
				const editor = pluginFunctions.getEditorRef()
				editor.focus()
			}
		}
	}

	const ImageButton = createPicker({
		triggerItem: decorateComponentWithProps(ImageTriggerButton, {
			shouldForceShowPreference,
			preferenceMenuComponent: decorateComponentWithProps(PreferenceMenu, {
				...menuDecoratedProps,
				shouldForceShowPreference,
				setEditorState: (editorState: EditorState) => pluginFunctions.setEditorState(editorState),
				getEditorState: () => pluginFunctions.getEditorState()
			})
		}),
		items: [
			decorateComponentWithProps(CreationMenu, menuDecoratedProps)
		]
	})

	return {
		initialize: (fns) => {
			pluginFunctions = fns
		},
		handleReturn: (event: KeyboardEvent, editorState: EditorState, fns: PluginFunctions) => {
			if (isImageBlockInSelection(editorState)) {
				fns.setEditorState(insertNewLine(editorState))
				return 'handled'
			}
			return 'not-handled'
		},
		onChange: (editorState: EditorState) => {
			let newEditorState = editorState
			if (lastEditorState
				&& isImageBlockInSelection(lastEditorState)) {
				newEditorState = EditorState.forceSelection(editorState, editorState.getSelection())
			}
			lastEditorState = editorState
			return newEditorState
		},
		blockRendererFn: (block: ContentBlock, fns: PluginFunctions) => {
			const editorState = fns.getEditorState()
			const contentState = editorState.getCurrentContent()
			if (isImageBlock(block, contentState)) {
				const selection = editorState.getSelection()
				const contentBlockKey = block.getKey()
				return {
					component: ThemedImage,
					editable: false,
					props: {
						isFocused: () =>
							selection.getAnchorKey() === contentBlockKey && isImageBlockInSelection(editorState),
						onClick: () =>
							fns.setEditorState(selectImageWithBlockKey(editorState, contentBlockKey))
					}
				}
			}
			return null
		},
		onDownArrow: (event: KeyboardEvent, fns: PluginFunctions) => {
			if (event.shiftKey) {
				return
			}
			const editorState = fns.getEditorState()
			if (isImageBlockInSelection(editorState)) {
				event.preventDefault()
				fns.setEditorState(selectNextBlock(editorState))
			}
		},
		onUpArrow: (event: KeyboardEvent, fns: PluginFunctions) => {
			if (event.shiftKey) {
				return
			}
			const editorState = fns.getEditorState()
			if (isImageBlockInSelection(editorState)) {
				event.preventDefault()
				fns.setEditorState(selectPrevBlock(editorState))
			}
		},
		keyBindingFn: (event: KeyboardEvent, fns: PluginFunctions) => {
			if (event.shiftKey) {
				return
			}
			const editorState = fns.getEditorState()
			if (isImageBlockInSelection(editorState)) {
				// arrow left
				if (event.keyCode === 37) {
					event.preventDefault()
					fns.setEditorState(selectPrevBlock(editorState))
				}
				// arrow right
				if (event.keyCode === 39) {
					event.preventDefault()
					fns.setEditorState(selectNextBlock(editorState))
				}
			}
		},
		addImage,
		ImageButton
	}
}
