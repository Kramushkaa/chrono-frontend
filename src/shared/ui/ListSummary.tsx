import React from 'react'

type Props = {
	items: Array<{ type: string }>
	className?: string
	style?: React.CSSProperties
}

export function ListSummary({ items, className, style }: Props) {
	const persons = items.filter(i => i.type === 'person').length
	const achievements = items.filter(i => i.type === 'achievement').length
	const periods = items.filter(i => i.type === 'period').length

	return (
		<div className={className} style={style}>
			{`Личностей: ${persons} • Достижений: ${achievements} • Периодов: ${periods}`}
		</div>
	)
}


