// Функция для конвертации в римские цифры
export const toRomanNumeral = (num: number): string => {
  const romanNumerals = [
    { value: 1000, numeral: 'M' },
    { value: 900, numeral: 'CM' },
    { value: 500, numeral: 'D' },
    { value: 400, numeral: 'CD' },
    { value: 100, numeral: 'C' },
    { value: 90, numeral: 'XC' },
    { value: 50, numeral: 'L' },
    { value: 40, numeral: 'XL' },
    { value: 10, numeral: 'X' },
    { value: 9, numeral: 'IX' },
    { value: 5, numeral: 'V' },
    { value: 4, numeral: 'IV' },
    { value: 1, numeral: 'I' }
  ]

  let result = ''
  let remaining = Math.abs(num)

  for (const { value, numeral } of romanNumerals) {
    while (remaining >= value) {
      result += numeral
      remaining -= value
    }
  }

  return num < 0 ? `-${result}` : result
}

// Функция для получения номера века
export const getCenturyNumber = (year: number): number => {
  if (year < 0) {
    // Для отрицательных лет: -1 до -100 = 1 век до н.э., -101 до -200 = 2 век до н.э.
    return Math.floor((Math.abs(year) - 1) / 100) + 1
  } else if (year === 0) {
    // Год 0 не существует в исторической хронологии
    return 1
  } else {
    // Для положительных лет: 1-100 = 1 век, 101-200 = 2 век и т.д.
    return Math.floor((year - 1) / 100) + 1
  }
}

// Функция для получения цвета века
export const getCenturyColor = (year: number, minYear: number) => {
  const colors = [
    'rgba(255, 107, 107, 0.1)', // Светло-красный
    'rgba(78, 205, 196, 0.1)', // Светло-голубой
    'rgba(150, 206, 180, 0.1)', // Светло-зеленый
    'rgba(255, 234, 167, 0.1)', // Светло-оранжевый
    'rgba(221, 160, 221, 0.1)', // Светло-фиолетовый
    'rgba(120, 219, 255, 0.1)', // Светло-бирюзовый
    'rgba(255, 255, 229, 0.1)', // Светло-желтый
    'rgba(255, 229, 240, 0.1)', // Светло-розовый
  ]
  
  const centuryIndex = Math.floor((year - minYear) / 100)
  return colors[centuryIndex % colors.length]
}

// Функция для генерации границ веков
export const generateCenturyBoundaries = (minYear: number, maxYear: number) => {
  const boundaries = []
  const startCentury = Math.floor(minYear / 100) * 100
  const endCentury = Math.ceil(maxYear / 100) * 100
  
  for (let year = startCentury; year <= endCentury; year += 100) {
    // Включаем границу, если она попадает в диапазон данных или является границей века
    if (year <= maxYear) {
      boundaries.push(year)
    }
  }
  return boundaries
}

// Функция для вычисления позиции в пикселях
export const getPosition = (year: number, minYear: number, pixelsPerYear: number, leftPadding: number) => {
  return leftPadding + (year - minYear) * pixelsPerYear
}

// Функция для вычисления ширины полоски в пикселях
export const getWidth = (birthYear: number, deathYear: number, pixelsPerYear: number) => {
  return (deathYear - birthYear) * pixelsPerYear
}

// Вспомогательная функция для извлечения первой страны из списка
// Перенесено в features/persons/utils/getFirstCountry


