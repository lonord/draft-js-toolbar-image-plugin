import { ContentBlock, ContentState, EditorState, EntityInstance, SelectionState } from 'draft-js'
import DraftOffsetKey from 'draft-js/lib/DraftOffsetKey'

export function selectImageWithBlockKey(editorState: EditorState, key: string) {
	const offsetKey = DraftOffsetKey.encode(key, 0, 0)
	const node = document.querySelectorAll(`[data-offset-key="${offsetKey}"]`)[0]
	// set the native selection to the node so the caret is not in the text and
	// the selectionState matches the native selection
	if (node) {
		const nativeSelection = window.getSelection()
		const range = document.createRange()
		range.setStart(node, 0)
		range.setEnd(node, 0)
		nativeSelection.removeAllRanges()
		nativeSelection.addRange(range)
	}

	const selection = editorState.getSelection()
	const sel = selection.merge({
		anchorKey: key,
		anchorOffset: 0,
		focusKey: key,
		focusOffset: 0
	}) as SelectionState
	return EditorState.forceSelection(editorState, sel)
}

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

export function removeImageData(editorState: EditorState, ...dataKeys: string[]) {
	const selection = editorState.getSelection()
	if (selection.getAnchorKey() !== selection.getFocusKey()) {
		return editorState
	}
	if (!dataKeys || dataKeys.length === 0) {
		return editorState
	}
	const contentState = editorState.getCurrentContent()
	const contentBlock = contentState.getBlockForKey(selection.getAnchorKey())
	if (contentBlock && contentBlock.getType() === 'atomic') {
		const entityKey = contentBlock.getEntityAt(0)
		const entity = contentState.getEntity(entityKey)
		if (entity && entity.getType().toUpperCase() === 'IMAGE') {
			const data = entity.getData()
			const newData: any = {}
			for (const k in data) {
				if (dataKeys.indexOf(k) === -1) {
					newData[k] = data[k]
				}
			}
			const newContentState = (contentState as any).replaceEntityData(entityKey, newData)
			return EditorState.push(editorState, newContentState, 'apply-entity')
		}
	}
	return editorState
}

export function getImageEntity(editorState: EditorState): EntityInstance {
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
