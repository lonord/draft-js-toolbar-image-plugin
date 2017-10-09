export default function validateCSSSize(str: string): string {
	if (!str) {
		return null
	}
	str = str.replace(/[ ]/g, '')
	let result = null
	if (/^[0-9]+$/.test(str)) {
		result = str + 'px'
	} else if (/^[0-9]+(px)$/.test(str)) {
		result = str
	} else if (/^[0-9]+(.[0-9]+)?(%|em|ex|pt|pc|in|mm|cm)$/.test(str)) {
		result = str
	} else {
		// tslint:disable-next-line:radix
		const n = parseInt(str)
		if (!isNaN(n)) {
			result = n + 'px'
		}
	}
	return result
}
