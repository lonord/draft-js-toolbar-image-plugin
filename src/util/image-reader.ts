function readFile(file: Blob): Promise<string> {
	return new Promise(resolve => {
		const reader = new FileReader()
		reader.onload = (e: any) => resolve(e.target.result)
		reader.onerror = () => resolve(null)
		reader.onabort = () => resolve(null)
		reader.readAsDataURL(file)
	})
}

export default async function (files: Blob[]): Promise<string[]> {
	const dataURLs: string[] = []
	for (const file of files) {
		const dataURL = await readFile(file)
		if (dataURL) {
			dataURLs.push(dataURL)
		}
	}
	return dataURLs
}
