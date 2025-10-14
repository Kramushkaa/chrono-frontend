import { useState } from 'react'

export function useManageModals() {
  const [isEditing, setIsEditing] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [createType, setCreateType] = useState<'person' | 'achievement' | 'period'>('person')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showEditWarning, setShowEditWarning] = useState(false)
  const [isReverting, setIsReverting] = useState(false)
  const [showCreateList, setShowCreateList] = useState(false)

  return {
    isEditing,
    setIsEditing,
    showCreate,
    setShowCreate,
    createType,
    setCreateType,
    showAuthModal,
    setShowAuthModal,
    showEditWarning,
    setShowEditWarning,
    isReverting,
    setIsReverting,
    showCreateList,
    setShowCreateList,
  }
}

