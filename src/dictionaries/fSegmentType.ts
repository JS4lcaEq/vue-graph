import type { DictionaryItem } from '@/dictionaries/fRoleInCase';

/** Справочник значений поля fSegmentType. */
export const fSegmentTypeDictionary: DictionaryItem[] = [
  { key: '1', value: '108. Стандартный' },
  { key: '2', value: '107. Верхний' },
  { key: '3', value: '106. Массовый' },
  { key: '4', value: '104. Средний бизнес' },
  { key: '5', value: '103. Крупный бизнес' },
];

const valueByKey = new Map(fSegmentTypeDictionary.map(item => [item.key, item.value]));

/** Разбирает строку fSegmentType в массив ключей справочника. */
export function parseFSegmentTypeKeys(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map(key => key.trim())
    .filter(key => key.length > 0 && valueByKey.has(key));
}

/** Сериализует выбранные ключи в строку fSegmentType. */
export function formatFSegmentTypeKeys(keys: string[]): string {
  return keys
    .filter(key => valueByKey.has(key))
    .join(',');
}

/** Возвращает подписи справочника для сохранённого значения fSegmentType. */
export function formatFSegmentTypeLabels(value: string | null | undefined): string {
  const labels = parseFSegmentTypeKeys(value)
    .map(key => valueByKey.get(key) ?? '')
    .filter(label => label.length > 0);

  return labels.join(', ');
}