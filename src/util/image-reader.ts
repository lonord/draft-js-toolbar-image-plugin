import genGUID from './guid'

function readFile(file: File): Promise<string> {
	return new Promise(resolve => {
		const reader = new FileReader()
		reader.onload = (e: any) => resolve(e.target.result)
		reader.onerror = () => resolve(null)
		reader.onabort = () => resolve(null)
		reader.readAsDataURL(file)
	})
}

export default async function (files: File[]): Promise<Array<{ url: string, id: string, file: File }>> {
	const dataURLs: Array<{ url: string, id: string, file: File }> = []
	for (const file of files) {
		const dataURL = await readFile(file)
		if (dataURL) {
			dataURLs.push({
				url: dataURL,
				id: genGUID(),
				file
			})
		}
	}
	return dataURLs
}
