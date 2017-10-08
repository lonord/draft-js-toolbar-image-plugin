import {
	AtomicBlockUtils,
	EditorState
} from 'draft-js'

export default (editorState: EditorState, url: string, extraData?) => {
	const urlType = 'IMAGE'
	const contentState = editorState.getCurrentContent()
	const contentStateWithEntity = contentState.createEntity(urlType, 'IMMUTABLE', { ...extraData, src: url })
	const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
	const newEditorState = AtomicBlockUtils.insertAtomicBlock(
		editorState,
		entityKey,
		' '
	)
	return EditorState.forceSelection(
		newEditorState,
		editorState.getCurrentContent().getSelectionAfter()
	)
}
