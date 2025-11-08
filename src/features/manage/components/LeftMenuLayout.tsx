import React from 'react'
import { LeftMenu, LeftMenuSelection } from './LeftMenu'
import type { UserList } from 'shared/types'

type ListItem = UserList & { readonly?: boolean }

type Props = {
	// Layout
	sidebarCollapsed: boolean
	gridWhenOpen?: string
	gridWhenCollapsed?: string

	// LeftMenu props
	menuId?: string
	selectedKey: string
	onSelect: (sel: LeftMenuSelection) => void
	isModerator: boolean
	pendingCount?: number | null
	mineCount?: number | null
	userLists: ListItem[]
	onAddList: () => void
	labelAll?: string
	onDeleteList?: (id: number) => void
	onShareList?: (id: number) => void
	onShowOnTimeline?: (id: number) => void
	readonlyListId?: number
	onCopySharedList?: (id: number) => void

	children: React.ReactNode
}

export function LeftMenuLayout(props: Props) {
	const {
		sidebarCollapsed,
		gridWhenOpen = '240px 8px 1fr',
		gridWhenCollapsed = '0px 8px 1fr',
		menuId,
		selectedKey,
		onSelect,
		isModerator,
		pendingCount,
		mineCount,
		userLists,
		onAddList,
		labelAll,
		onDeleteList,
		onShareList,
		onShowOnTimeline,
		readonlyListId,
		onCopySharedList,
		children
	} = props

	return (
		<div style={{ 
			display: 'grid', 
			gridTemplateColumns: sidebarCollapsed ? gridWhenCollapsed : gridWhenOpen, 
			gap: 16, 
			transition: 'grid-template-columns 0.2s ease',
			minHeight: 'calc(100vh - 120px)' // Растягиваем на полную высоту экрана минус хедер и табы
		}}>
			<LeftMenu
				id={menuId}
				selectedKey={selectedKey}
				onSelect={onSelect}
				isModerator={isModerator}
				pendingCount={pendingCount}
				mineCount={mineCount}
				userLists={userLists}
				onAddList={onAddList}
				labelAll={labelAll}
				onDeleteList={onDeleteList}
				onShareList={onShareList}
				onShowOnTimeline={onShowOnTimeline}
				readonlyListId={readonlyListId}
				onCopySharedList={onCopySharedList}
			/>
			<div style={{ minWidth: 0 }}>
				{children}
			</div>
		</div>
	)
}






