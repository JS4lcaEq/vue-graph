import { describe, expect, it } from 'vitest';

import {
  fCommitmentRoleDictionary,
  fKIBDictionary,
  fMemberStatusDictionary,
  fNoneResidentDictionary,
  fRoleInCaseDictionary,
  fSegmentTypeDictionary,
  formatDictionaryKeys,
  formatDictionaryLabels,
  parseDictionaryKeys,
} from './filterDictionaries';

describe.each([
  {
    name: 'fRoleInCase',
    dictionary: fRoleInCaseDictionary,
    keys: ['1', '3'],
    labels: 'Истец, Третье лицо',
  },
  {
    name: 'fCommitmentRole',
    dictionary: fCommitmentRoleDictionary,
    keys: ['1', '2'],
    labels: 'Поручитель, Заемщик',
  },
  {
    name: 'fMemberStatus',
    dictionary: fMemberStatusDictionary,
    keys: ['1', '5'],
    labels: 'ЮЛ, Банк',
  },
  {
    name: 'fNoneResident',
    dictionary: fNoneResidentDictionary,
    keys: ['1', '2'],
    labels: 'Да, Нет',
  },
  {
    name: 'fSegmentType',
    dictionary: fSegmentTypeDictionary,
    keys: ['1', '2'],
    labels: '108. Стандартный, 107. Верхний',
  },
  {
    name: 'fKIB',
    dictionary: fKIBDictionary,
    keys: ['1', '2'],
    labels: 'Да, Нет',
  },
])('$name dictionary helpers', ({ dictionary, keys, labels }) => {
  it('сериализует и разбирает ключи справочника', () => {
    const serialized = formatDictionaryKeys(dictionary, keys);
    expect(parseDictionaryKeys(dictionary, serialized)).toEqual(keys);
  });

  it('возвращает подписи справочника', () => {
    expect(formatDictionaryLabels(dictionary, formatDictionaryKeys(dictionary, keys))).toBe(labels);
  });

  it('игнорирует неизвестные ключи', () => {
    const [first, second] = keys;
    expect(parseDictionaryKeys(dictionary, `${first},99,${second}`)).toEqual([first, second]);
    expect(formatDictionaryKeys(dictionary, [first!, '99'])).toBe(first);
  });
});