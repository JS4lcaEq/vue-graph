import { describe, expect, it } from 'vitest'

import {
  formatFSegmentTypeKeys,
  formatFSegmentTypeLabels,
  parseFSegmentTypeKeys,
} from './fSegmentType'

describe('fSegmentType dictionary helpers', () => {
  it('сериализует и разбирает ключи справочника', () => {
    expect(formatFSegmentTypeKeys(['1', '3'])).toBe('1,3')
    expect(parseFSegmentTypeKeys('1,3')).toEqual(['1', '3'])
  })

  it('возвращает подписи справочника', () => {
    expect(formatFSegmentTypeLabels('1,2')).toBe('108. Стандартный, 107. Верхний')
  })

  it('игнорирует неизвестные ключи и пустые подписи при отображении', () => {
    expect(parseFSegmentTypeKeys('1,99,5')).toEqual(['1', '5'])
    expect(formatFSegmentTypeKeys(['1', '99'])).toBe('1')
    expect(formatFSegmentTypeLabels('1,5,6')).toBe('108. Стандартный, 103. Крупный бизнес')
  })
})