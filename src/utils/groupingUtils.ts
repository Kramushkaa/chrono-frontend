import { Person } from '../types'
import { getCategoryColor, getCategoryColorDark, getCategoryColorMuted } from './categoryColors'

export const getCategoryPriority = (category: string) => {
  const priorities: { [key: string]: number } = {
    'Правители': 1,
    'Военачальники': 2,
    'Ученые': 3,
    'Художники': 4,
    'Писатели': 5,
    'Философы': 6,
    'Исследователи': 7,
    'Религиозные деятели': 8,
    'Музыканты': 9,
    'Архитекторы': 10
  }
  return priorities[category] || 999
}

export const getGroupColor = (groupName: string) => {
  if (groupName.includes('Правители')) return '#d32f2f'
  if (groupName.includes('Военачальники')) return '#f57c00'
  if (groupName.includes('Ученые')) return '#1976d2'
  if (groupName.includes('Художники')) return '#388e3c'
  if (groupName.includes('Писатели')) return '#7b1fa2'
  if (groupName.includes('Философы')) return '#5d4037'
  if (groupName.includes('Исследователи')) return '#00838f'
  if (groupName.includes('Религиозные деятели')) return '#c2185b'
  if (groupName.includes('Музыканты')) return '#ff8f00'
  if (groupName.includes('Архитекторы')) return '#4e342e'
  
  // Для стран используем цвета категорий
  return getCategoryColor(groupName)
}

export const getGroupColorDark = (groupName: string) => {
  if (groupName.includes('Правители')) return '#b71c1c'
  if (groupName.includes('Военачальники')) return '#e65100'
  if (groupName.includes('Ученые')) return '#0d47a1'
  if (groupName.includes('Художники')) return '#1b5e20'
  if (groupName.includes('Писатели')) return '#4a148c'
  if (groupName.includes('Философы')) return '#3e2723'
  if (groupName.includes('Исследователи')) return '#006064'
  if (groupName.includes('Религиозные деятели')) return '#880e4f'
  if (groupName.includes('Музыканты')) return '#e65100'
  if (groupName.includes('Архитекторы')) return '#3e2723'
  
  // Для стран используем цвета категорий
  return getCategoryColorDark(groupName)
}

export const getGroupColorMuted = (groupName: string) => {
  if (groupName.includes('Правители')) return '#ffcdd2'
  if (groupName.includes('Военачальники')) return '#ffe0b2'
  if (groupName.includes('Ученые')) return '#bbdefb'
  if (groupName.includes('Художники')) return '#c8e6c9'
  if (groupName.includes('Писатели')) return '#e1bee7'
  if (groupName.includes('Философы')) return '#d7ccc8'
  if (groupName.includes('Исследователи')) return '#b2ebf2'
  if (groupName.includes('Религиозные деятели')) return '#f8bbd9'
  if (groupName.includes('Музыканты')) return '#ffe0b2'
  if (groupName.includes('Архитекторы')) return '#d7ccc8'
  
  // Для стран используем цвета категорий
  return getCategoryColorMuted(groupName)
}

export const getPersonGroup = (person: Person, groupingType: 'category' | 'country' | 'none') => {
  if (groupingType === 'none') return 'none'
  
  if (groupingType === 'category') {
    return person.category || 'Неизвестно'
  }
  
  if (groupingType === 'country') {
    return person.country || 'Неизвестно'
  }
  
  return 'none'
}

export const sortGroupedData = (data: Person[], groupingType: 'category' | 'country' | 'none') => {
  if (groupingType === 'none') {
    return data.sort((a, b) => a.birthYear - b.birthYear)
  }

  // Группируем данные
  const grouped = data.reduce((acc, person) => {
    const group = getPersonGroup(person, groupingType)
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(person)
    return acc
  }, {} as { [key: string]: Person[] })

  // Сортируем группы
  const sortedGroups = Object.keys(grouped).sort((a, b) => {
    if (groupingType === 'category') {
      return getCategoryPriority(a) - getCategoryPriority(b)
    }
    return a.localeCompare(b)
  })

  // Сортируем личности внутри групп по году рождения
  sortedGroups.forEach(group => {
    grouped[group].sort((a, b) => a.birthYear - b.birthYear)
  })

  // Возвращаем плоский массив
  return sortedGroups.flatMap(group => grouped[group])
} 