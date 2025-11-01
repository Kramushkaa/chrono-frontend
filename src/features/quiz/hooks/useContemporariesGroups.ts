import { useState, useEffect, useCallback } from 'react'
import { ContemporariesQuestionData, QuizAnswer } from '../types'

interface UseContemporariesGroupsParams {
  persons: ContemporariesQuestionData['persons']
  showFeedback?: boolean
  userAnswer?: QuizAnswer | null
}

export function useContemporariesGroups({ persons, showFeedback, userAnswer }: UseContemporariesGroupsParams) {
  const [groups, setGroups] = useState<string[][]>([persons.map((p) => p.id).sort(() => Math.random() - 0.5)])

  // Reset when persons change
  useEffect(() => {
    // В режиме просмотра результатов восстанавливаем ответ пользователя
    if (showFeedback && userAnswer) {
      setGroups(userAnswer.answer as string[][]);
    } else {
      setGroups([persons.map((p) => p.id).sort(() => Math.random() - 0.5)]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persons, showFeedback, userAnswer?.questionId])

  // Создание новой группы
  const createGroup = useCallback((personId: string) => {
    setGroups((prevGroups) => {
      const newGroups = [...prevGroups]
      
      // Находим и удаляем из текущей группы
      const currentGroupIndex = newGroups.findIndex((group) => group.includes(personId))
      if (currentGroupIndex !== -1) {
        newGroups[currentGroupIndex] = newGroups[currentGroupIndex].filter((id) => id !== personId)
        
        // Если группа стала пустой, удаляем её
        if (newGroups[currentGroupIndex].length === 0) {
          newGroups.splice(currentGroupIndex, 1)
        }
      }
      
      // Создаем новую группу
      newGroups.push([personId])
      return newGroups
    })
  }, [])

  // Добавление личности в существующую группу
  const addToGroup = useCallback((personId: string, targetGroupIndex: number) => {
    setGroups((prevGroups) => {
      const newGroups = [...prevGroups]
      let groupIndex = targetGroupIndex
      
      // Удаляем из текущей группы
      const currentGroupIndex = newGroups.findIndex((group) => group.includes(personId))
      if (currentGroupIndex !== -1) {
        newGroups[currentGroupIndex] = newGroups[currentGroupIndex].filter((id) => id !== personId)
        
        // Если группа стала пустой, удаляем её
        if (newGroups[currentGroupIndex].length === 0) {
          newGroups.splice(currentGroupIndex, 1)
          // Корректируем индекс целевой группы, если она была после удаленной
          if (groupIndex > currentGroupIndex) {
            groupIndex--
          }
        }
      }
      
      // Добавляем в целевую группу
      if (newGroups[groupIndex]) {
        newGroups[groupIndex] = [...newGroups[groupIndex], personId]
      }
      
      return newGroups
    })
  }, [])

  // Удаление группы
  const removeGroup = useCallback((groupIndex: number) => {
    setGroups((prevGroups) => {
      const newGroups = [...prevGroups]
      const removedPersonIds = newGroups[groupIndex]
      newGroups.splice(groupIndex, 1)
      
      // Если есть другие группы, возвращаем всех в первую доступную группу
      if (newGroups.length > 0) {
        newGroups[0] = [...newGroups[0], ...removedPersonIds]
      } else {
        // Если это была последняя группа, создаем новую с удаленными личностями
        newGroups.push(removedPersonIds)
      }
      
      return newGroups
    })
  }, [])

  return {
    groups,
    createGroup,
    addToGroup,
    removeGroup,
  }
}




