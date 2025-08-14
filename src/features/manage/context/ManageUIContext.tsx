import React, { createContext, useContext } from 'react'

type ManageUIValue = {
  openAddAchievement: (id: number) => void
  openAddPeriod: (id: number) => void
  openAddForSelectedPerson: () => void
}

const ManageUIContext = createContext<ManageUIValue | null>(null)

export function ManageUIProvider({ value, children }: { value: ManageUIValue; children: React.ReactNode }) {
  return <ManageUIContext.Provider value={value}>{children}</ManageUIContext.Provider>
}

export function useManageUI(): ManageUIValue {
  const ctx = useContext(ManageUIContext)
  if (!ctx) throw new Error('useManageUI must be used within ManageUIProvider')
  return ctx
}


