import { describe, expect, it } from 'vitest'

import {
  formatFRoleInCaseKeys,
  formatFRoleInCaseLabels,
  parseFRoleInCaseKeys,
} from './fRoleInCase'

describe('fRoleInCase dictionary helpers', () => {
  it('сериализует и разбирает ключи справочника', () => {
    expect(formatFRoleInCaseKeys(['1', '3'])).toBe('1,3')
    expect(parseFRoleInCaseKeys('1,3')).toEqual(['1', '3'])
  })

  it('возвращает подписи справочника', () => {
    expect(formatFRoleInCaseLabels('1,2')).toBe('Истец, Ответчик')
  })

  it('игнорирует неизвестные ключи', () => {
    expect(parseFRoleInCaseKeys('1,99,2')).toEqual(['1', '2'])
    expect(formatFRoleInCaseKeys(['1', '99'])).toBe('1')
  })
})