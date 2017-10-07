import debug from 'debug'
import decorateComponentWithProps from 'decorate-component-with-props'
import { ContentBlock, Editor, EditorState } from 'draft-js'
import createPicker from 'draft-js-plugin-editor-toolbar-picker'
import * as React from 'react'

const d = debug('draft-js-toolbar-image-plugin:example')

interface PluginFunctions {
	setEditorState(editorState: EditorState)
	getEditorState(): EditorState
	getReadOnly(): boolean
	getEditorRef(): Editor
}

export interface ToolbarImagePluginOptions {
	abc?: string
}

export default function createToolbarImagePlugin(options?: ToolbarImagePluginOptions) {
	options = options || {}

	let pluginFunctions: PluginFunctions

	return {
		initialize: (fns) => {
			pluginFunctions = fns
		}
	}
}
