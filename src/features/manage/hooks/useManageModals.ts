import { useState } from 'react'
import type { PeriodEntity } from '../components/PeriodEditModal'
import type { Achievement } from 'shared/types'

export function useManageModals() {
  const [isEditing, setIsEditing] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [createType, setCreateType] = useState<'person' | 'achievement' | 'period'>('person')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showEditWarning, setShowEditWarning] = useState(false)
  const [isReverting, setIsReverting] = useState(false)
  const [showCreateList, setShowCreateList] = useState(false)
  const [showListPublication, setShowListPublication] = useState(false)
  const [isEditingPeriod, setIsEditingPeriod] = useState(false)
  const [isEditingAchievement, setIsEditingAchievement] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodEntity | null>(null)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)

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
    showListPublication,
    setShowListPublication,
    isEditingPeriod,
    setIsEditingPeriod,
    isEditingAchievement,
    setIsEditingAchievement,
    selectedPeriod,
    setSelectedPeriod,
    selectedAchievement,
    setSelectedAchievement,
  }
}




