import * as React from 'react'
import unionClassNames from 'union-class-names'

import validateCSSSize from '../util/css-size-validator'
import { Image as StyledImage } from './styled'

export default class Image extends React.Component<any, any> {

	handleImageClick = (e: React.SyntheticEvent<HTMLImageElement>) => {
		e.preventDefault()
		const { blockProps } = this.props
		if (!(blockProps.isFocused && blockProps.isFocused())) {
			blockProps.onClick(e)
		}
	}

	render() {
		const {
			block,
			className,
			theme,
			...otherProps
		} = this.props
		// leveraging destructuring to omit certain properties from props
		const {
			blockProps,
			customStyleMap,
			customStyleFn,
			decorator,
			forceSelection,
			offsetKey,
			selection,
			tree,
			contentState,
			...elementProps
		} = otherProps
		const { src, width, alignment } = contentState.getEntity(block.getEntityAt(0)).getData()
		const style: any = {
			display: 'block'
		}
		if (width) {
			const result = validateCSSSize(width)
			if (result) {
				style.width = result
			}
		}
		if (alignment === 'center') {
			style.marginLeft = 'auto'
			style.marginRight = 'auto'
		}
		if (theme) {
			const combinedClassName = blockProps && blockProps.isFocused && blockProps.isFocused()
				? unionClassNames(theme && theme.image, theme && theme.imageFocus, className)
				: unionClassNames(theme && theme.image, className)
			return (
				<img
					{...elementProps}
					style={style}
					onClick={this.handleImageClick}
					src={src}
					role="presentation"
					className={combinedClassName}
				/>
			)
		} else {
			return (
				<StyledImage
					{...elementProps}
					style={style}
					focused={blockProps.isFocused && blockProps.isFocused()}
					onClick={this.handleImageClick}
					src={src}
					role="presentation"
					className={className}/>
			)
		}
	}
}
