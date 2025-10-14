import { useMemo } from 'react'
import { ContemporariesQuestionData, QuizAnswer } from '../types'

interface UseContemporariesFeedbackParams {
  showFeedback: boolean
  userAnswer: QuizAnswer | null | undefined
  data: ContemporariesQuestionData
}

/**
 * Hook для анализа правильности групп современников
 * Возвращает статус для каждой личности: correct | incorrect | missing
 */
export function useContemporariesFeedback({ showFeedback, userAnswer, data }: UseContemporariesFeedbackParams) {
  const personStatuses = useMemo(() => {
    if (!showFeedback || !userAnswer) return {}

    const userGroups = userAnswer.answer as string[][]
    const correctGroups = data.correctGroups
    const status: { [personId: string]: 'correct' | 'incorrect' | 'missing' } = {}

    // Инициализируем всех личностей как отсутствующих
    const allPersonIds = new Set<string>()
    userGroups.forEach((group) => group.forEach((id) => allPersonIds.add(id)))
    correctGroups.forEach((group) => group.forEach((id) => allPersonIds.add(id)))

    allPersonIds.forEach((personId) => {
      status[personId] = 'missing'
    })

    // Проверяем каждую группу пользователя
    userGroups.forEach((userGroup) => {
      // Находим соответствующую правильную группу
      const matchingCorrectGroup = correctGroups.find((correctGroup) => correctGroup.some((id) => userGroup.includes(id)))

      if (matchingCorrectGroup) {
        // Проверяем, полная ли группа (содержит всех нужных людей)
        const isGroupComplete = matchingCorrectGroup.every((id) => userGroup.includes(id))

        if (isGroupComplete) {
          // Группа полная - правильные зеленые, лишние красные
          userGroup.forEach((personId) => {
            if (matchingCorrectGroup.includes(personId)) {
              status[personId] = 'correct'
            } else {
              status[personId] = 'incorrect' // Лишние
            }
          })
        } else {
          // Группа неполная - все красные
          userGroup.forEach((personId) => {
            status[personId] = 'incorrect'
          })
        }
      } else {
        // Если нет соответствующей правильной группы, все неправильные
        userGroup.forEach((personId) => {
          status[personId] = 'incorrect'
        })
      }
    })

    return status
  }, [showFeedback, userAnswer, data.correctGroups])

  return personStatuses
}

