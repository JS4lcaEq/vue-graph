import type { DictionaryItem } from '@/dictionaries/fRoleInCase';

/** Справочник значений поля fCommitmentRole. */
export const fCommitmentRoleDictionary: DictionaryItem[] = [
  { key: '1', value: 'Поручитель' },
  { key: '2', value: 'Заемщик' },
  { key: '3', value: 'Эммитент' },
  { key: '4', value: 'Цессионарий' },
  { key: '5', value: 'Цедент' },
  { key: '6', value: 'Субподрядчик' },
];

const valueByKey = new Map(fCommitmentRoleDictionary.map(item => [item.key, item.value]));

/** Разбирает строку fCommitmentRole в массив ключей справочника. */
export function parseFCommitmentRoleKeys(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map(key => key.trim())
    .filter(key => key.length > 0 && valueByKey.has(key));
}

/** Сериализует выбранные ключи в строку fCommitmentRole. */
export function formatFCommitmentRoleKeys(keys: string[]): string {
  return keys
    .filter(key => valueByKey.has(key))
    .join(',');
}

/** Возвращает подписи справочника для сохранённого значения fCommitmentRole. */
export function formatFCommitmentRoleLabels(value: string | null | undefined): string {
  const labels = parseFCommitmentRoleKeys(value)
    .map(key => valueByKey.get(key))
    .filter((label): label is string => label !== undefined);

  return labels.join(', ');
}