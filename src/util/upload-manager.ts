export type UploadStatus = 'uploading' | 'succeed' | 'failed'

export interface UploadTask {
	getStatus(): UploadStatus
	getErrorMessage(): string
	getFileUrl(): string
	onStatusChange(fn: (status: UploadStatus) => void)
	offStatusChange(fn: (status: UploadStatus) => void)
	retry()
}

export interface UploadManager {
	getTask(fileId: string): UploadTask
	addTask(fileId: string, file: File)
}

export type UploadHandler = (file: File, completeCallback: (err: Error | string, url: string) => void) => void

export interface UploadManagerOptions {
	imageUploadHandler: UploadHandler
}

export default function createUploadManager(options: UploadManagerOptions): UploadManager {

	const { imageUploadHandler } = options
	const taskMap: { [x: string]: UploadTask } = {}

	return {
		addTask: (fileId: string, file: File) => {
			taskMap[fileId] = createTask(file, imageUploadHandler)
		},
		getTask: (fileId: string) => taskMap[fileId]
	}
}

function createTask(file: File, uploadHandler: UploadHandler): UploadTask {

	const statusListeners: Array<(status: UploadStatus) => void> = []

	let status: UploadStatus
	let errorMessage: string
	let fileUrl: string

	const startUpload = () => {
		errorMessage = null
		status = 'uploading'
		fileUrl = null
		statusListeners.forEach(fn => fn(status))
		uploadHandler(file, (err, url) => {
			if (err) {
				status = 'failed'
				errorMessage = (err instanceof Error) ? err.message : err
			} else {
				status = 'succeed'
				fileUrl = url
			}
			statusListeners.forEach(fn => fn(status))
		})
	}

	startUpload()

	return {
		getStatus: () => status,
		getErrorMessage: () => errorMessage,
		getFileUrl: () => fileUrl,
		onStatusChange: (fn) => statusListeners.push(fn),
		offStatusChange: (fn) => {
			const idx = statusListeners.indexOf(fn)
			idx >= 0 && statusListeners.splice(idx, 1)
		},
		retry: () => status !== 'uploading' && startUpload()
	}
}
