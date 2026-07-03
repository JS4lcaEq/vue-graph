import { describe, expect, it } from 'vitest'

import {
  formatFKIBKeys,
  formatFKIBLabels,
  parseFKIBKeys,
} from './fKIB'

describe('fKIB dictionary helpers', () => {
  it('сериализует и разбирает ключи справочника', () => {
    expect(formatFKIBKeys(['1', '2'])).toBe('1,2')
    expect(parseFKIBKeys('1,2')).toEqual(['1', '2'])
  })

  it('возвращает подписи справочника', () => {
    expect(formatFKIBLabels('1,2')).toBe('Да, Нет')
  })

  it('игнорирует неизвестные ключи', () => {
    expect(parseFKIBKeys('1,99,2')).toEqual(['1', '2'])
    expect(formatFKIBKeys(['1', '99'])).toBe('1')
  })
})