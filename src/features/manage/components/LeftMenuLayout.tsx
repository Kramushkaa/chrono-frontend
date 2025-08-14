import React from 'react'
import { LeftMenu, LeftMenuSelection } from './LeftMenu'

type ListItem = { id: number; title: string; items_count?: number; readonly?: boolean }

type Props = {
	// Layout
	sidebarCollapsed: boolean
	setSidebarCollapsed: (updater: (prev: boolean) => boolean) => void
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
		setSidebarCollapsed,
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
		<div style={{ display: 'grid', gridTemplateColumns: sidebarCollapsed ? gridWhenCollapsed : gridWhenOpen, gap: 16, transition: 'grid-template-columns 0.2s ease' }}>
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
			<div style={{ position: 'relative' }}>
				<button
					onClick={() => setSidebarCollapsed(c => !c)}
					aria-pressed={sidebarCollapsed}
					aria-label={sidebarCollapsed ? 'Показать меню' : 'Скрыть меню'}
					title={sidebarCollapsed ? 'Показать меню' : 'Скрыть меню'}
					style={{ position: 'absolute', left: -8, top: 0, width: 16, height: 32 }}
				>{sidebarCollapsed ? '⟩' : '⟨'}</button>
			</div>
			<div style={{ minWidth: 0 }}>
				{children}
			</div>
		</div>
	)
}



