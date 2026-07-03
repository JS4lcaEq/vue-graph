import { describe, expect, it } from 'vitest'

import {
  formatFCommitmentRoleKeys,
  formatFCommitmentRoleLabels,
  parseFCommitmentRoleKeys,
} from './fCommitmentRole'

describe('fCommitmentRole dictionary helpers', () => {
  it('сериализует и разбирает ключи справочника', () => {
    expect(formatFCommitmentRoleKeys(['1', '3'])).toBe('1,3')
    expect(parseFCommitmentRoleKeys('1,3')).toEqual(['1', '3'])
  })

  it('возвращает подписи справочника', () => {
    expect(formatFCommitmentRoleLabels('1,2')).toBe('Поручитель, Заемщик')
  })

  it('игнорирует неизвестные ключи', () => {
    expect(parseFCommitmentRoleKeys('1,99,2')).toEqual(['1', '2'])
    expect(formatFCommitmentRoleKeys(['1', '99'])).toBe('1')
  })
})