import { ContentBlock, ContentState, EditorState, SelectionState } from 'draft-js'

export function isImageBlock(contentBlock: ContentBlock, contentState: ContentState) {
	if (contentBlock && contentBlock.getType() === 'atomic') {
		const entityKey = contentBlock.getEntityAt(0)
		const entity = contentState.getEntity(entityKey)
		return entity && entity.getType().toUpperCase() === 'IMAGE'
	}
	return false
}

export function isImageBlockInSelection(editorState: EditorState) {
	const selection = editorState.getSelection()
	if (selection.getAnchorKey() !== selection.getFocusKey()) {
		return false
	}
	const contentState = editorState.getCurrentContent()
	const contentBlock = contentState.getBlockForKey(selection.getAnchorKey())
	return isImageBlock(contentBlock, contentState)
}

export function selectPrevBlock(editorState: EditorState) {
	const selection = editorState.getSelection()
	const selectionKey = selection.getAnchorKey()
	const contentBlock = editorState.getCurrentContent().getBlockBefore(selectionKey)
	return contentBlock
		? EditorState.forceSelection(editorState, new SelectionState({
			anchorKey: contentBlock.getKey(),
			anchorOffset: contentBlock.getLength(),
			focusKey: contentBlock.getKey(),
			focusOffset: contentBlock.getLength(),
			isBackward: false
		}))
		: editorState
}

export function selectNextBlock(editorState: EditorState) {
	const selection = editorState.getSelection()
	const selectionKey = selection.getAnchorKey()
	const contentBlock = editorState.getCurrentContent().getBlockAfter(selectionKey)
	return contentBlock
		? EditorState.forceSelection(editorState, new SelectionState({
			anchorKey: contentBlock.getKey(),
			anchorOffset: 0,
			focusKey: contentBlock.getKey(),
			focusOffset: 0,
			isBackward: false
		}))
		: editorState
}

export function updateImageData(editorState: EditorState, data) {
	const selection = editorState.getSelection()
	if (selection.getAnchorKey() !== selection.getFocusKey()) {
		return editorState
	}
	const contentState = editorState.getCurrentContent()
	const contentBlock = contentState.getBlockForKey(selection.getAnchorKey())
	if (contentBlock && contentBlock.getType() === 'atomic') {
		const entityKey = contentBlock.getEntityAt(0)
		const entity = contentState.getEntity(entityKey)
		if (entity && entity.getType().toUpperCase() === 'IMAGE') {
			const newContentState = contentState.mergeEntityData(entityKey, data)
			return EditorState.push(editorState, newContentState, 'apply-entity')
		}
	}
	return editorState
}

export function getImageEntity(editorState: EditorState) {
	const selection = editorState.getSelection()
	if (selection.getAnchorKey() !== selection.getFocusKey()) {
		return null
	}
	const contentState = editorState.getCurrentContent()
	const contentBlock = contentState.getBlockForKey(selection.getAnchorKey())
	if (contentBlock && contentBlock.getType() === 'atomic') {
		const entityKey = contentBlock.getEntityAt(0)
		const entity = contentState.getEntity(entityKey)
		if (entity && entity.getType().toUpperCase() === 'IMAGE') {
			return entity
		}
	}
	return null
}

export function getImageEntityKey(editorState: EditorState) {
	const selection = editorState.getSelection()
	if (selection.getAnchorKey() !== selection.getFocusKey()) {
		return null
	}
	const contentState = editorState.getCurrentContent()
	const contentBlock = contentState.getBlockForKey(selection.getAnchorKey())
	if (contentBlock && contentBlock.getType() === 'atomic') {
		const entityKey = contentBlock.getEntityAt(0)
		const entity = contentState.getEntity(entityKey)
		if (entity && entity.getType().toUpperCase() === 'IMAGE') {
			return entityKey
		}
	}
	return null
}
