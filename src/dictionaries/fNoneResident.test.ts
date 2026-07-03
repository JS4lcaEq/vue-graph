import { describe, expect, it } from 'vitest'

import {
  formatFNoneResidentKeys,
  formatFNoneResidentLabels,
  parseFNoneResidentKeys,
} from './fNoneResident'

describe('fNoneResident dictionary helpers', () => {
  it('сериализует и разбирает ключи справочника', () => {
    expect(formatFNoneResidentKeys(['1', '2'])).toBe('1,2')
    expect(parseFNoneResidentKeys('1,2')).toEqual(['1', '2'])
  })

  it('возвращает подписи справочника', () => {
    expect(formatFNoneResidentLabels('1,2')).toBe('Да, Нет')
  })

  it('игнорирует неизвестные ключи', () => {
    expect(parseFNoneResidentKeys('1,99,2')).toEqual(['1', '2'])
    expect(formatFNoneResidentKeys(['1', '99'])).toBe('1')
  })
})