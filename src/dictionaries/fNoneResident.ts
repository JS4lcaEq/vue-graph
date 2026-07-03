import type { DictionaryItem } from '@/dictionaries/fRoleInCase';

/** Справочник значений поля fNoneResident. */
export const fNoneResidentDictionary: DictionaryItem[] = [
  { key: '1', value: 'Да' },
  { key: '2', value: 'Нет' },
];

const valueByKey = new Map(fNoneResidentDictionary.map(item => [item.key, item.value]));

/** Разбирает строку fNoneResident в массив ключей справочника. */
export function parseFNoneResidentKeys(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map(key => key.trim())
    .filter(key => key.length > 0 && valueByKey.has(key));
}

/** Сериализует выбранные ключи в строку fNoneResident. */
export function formatFNoneResidentKeys(keys: string[]): string {
  return keys
    .filter(key => valueByKey.has(key))
    .join(',');
}

/** Возвращает подписи справочника для сохранённого значения fNoneResident. */
export function formatFNoneResidentLabels(value: string | null | undefined): string {
  const labels = parseFNoneResidentKeys(value)
    .map(key => valueByKey.get(key))
    .filter((label): label is string => label !== undefined);

  return labels.join(', ');
}