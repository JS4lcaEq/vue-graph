import type { DictionaryItem } from '@/dictionaries/fRoleInCase';

/** Справочник значений поля fKIB. */
export const fKIBDictionary: DictionaryItem[] = [
  { key: '1', value: 'Да' },
  { key: '2', value: 'Нет' },
];

const valueByKey = new Map(fKIBDictionary.map(item => [item.key, item.value]));

/** Разбирает строку fKIB в массив ключей справочника. */
export function parseFKIBKeys(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map(key => key.trim())
    .filter(key => key.length > 0 && valueByKey.has(key));
}

/** Сериализует выбранные ключи в строку fKIB. */
export function formatFKIBKeys(keys: string[]): string {
  return keys
    .filter(key => valueByKey.has(key))
    .join(',');
}

/** Возвращает подписи справочника для сохранённого значения fKIB. */
export function formatFKIBLabels(value: string | null | undefined): string {
  const labels = parseFKIBKeys(value)
    .map(key => valueByKey.get(key))
    .filter((label): label is string => label !== undefined);

  return labels.join(', ');
}