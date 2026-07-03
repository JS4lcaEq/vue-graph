import { describe, expect, it } from 'vitest'

import {
  formatFMemberStatusKeys,
  formatFMemberStatusLabels,
  parseFMemberStatusKeys,
} from './fMemberStatus'

describe('fMemberStatus dictionary helpers', () => {
  it('сериализует и разбирает ключи справочника', () => {
    expect(formatFMemberStatusKeys(['1', '3'])).toBe('1,3')
    expect(parseFMemberStatusKeys('1,3')).toEqual(['1', '3'])
  })

  it('возвращает подписи справочника', () => {
    expect(formatFMemberStatusLabels('1,2')).toBe('ЮЛ, ИП')
  })

  it('игнорирует неизвестные ключи', () => {
    expect(parseFMemberStatusKeys('1,99,2')).toEqual(['1', '2'])
    expect(formatFMemberStatusKeys(['1', '99'])).toBe('1')
  })
})