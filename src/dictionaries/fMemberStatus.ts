import type { DictionaryItem } from '@/dictionaries/fRoleInCase';

/** Справочник значений поля fMemberStatus. */
export const fMemberStatusDictionary: DictionaryItem[] = [
  { key: '1', value: 'ЮЛ' },
  { key: '2', value: 'ИП' },
  { key: '3', value: 'ФП' },
  { key: '4', value: 'ДП' },
  { key: '5', value: 'Банк' },
];

const valueByKey = new Map(fMemberStatusDictionary.map(item => [item.key, item.value]));

/** Разбирает строку fMemberStatus в массив ключей справочника. */
export function parseFMemberStatusKeys(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map(key => key.trim())
    .filter(key => key.length > 0 && valueByKey.has(key));
}

/** Сериализует выбранные ключи в строку fMemberStatus. */
export function formatFMemberStatusKeys(keys: string[]): string {
  return keys
    .filter(key => valueByKey.has(key))
    .join(',');
}

/** Возвращает подписи справочника для сохранённого значения fMemberStatus. */
export function formatFMemberStatusLabels(value: string | null | undefined): string {
  const labels = parseFMemberStatusKeys(value)
    .map(key => valueByKey.get(key))
    .filter((label): label is string => label !== undefined);

  return labels.join(', ');
}