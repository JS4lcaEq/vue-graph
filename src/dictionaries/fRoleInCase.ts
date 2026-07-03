export interface DictionaryItem {
  key: string;
  value: string;
}

/** Справочник значений поля fRoleInCase. */
export const fRoleInCaseDictionary: DictionaryItem[] = [
  { key: '1', value: 'Истец' },
  { key: '2', value: 'Ответчик' },
  { key: '3', value: 'Третье лицо' },
  { key: '4', value: 'Потерпевший' },
  { key: '5', value: 'Клиент' },
  { key: '6', value: 'Субъект ответственности' },
];

const valueByKey = new Map(fRoleInCaseDictionary.map(item => [item.key, item.value]));

/** Разбирает строку fRoleInCase в массив ключей справочника. */
export function parseFRoleInCaseKeys(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map(key => key.trim())
    .filter(key => key.length > 0 && valueByKey.has(key));
}

/** Сериализует выбранные ключи в строку fRoleInCase. */
export function formatFRoleInCaseKeys(keys: string[]): string {
  return keys
    .filter(key => valueByKey.has(key))
    .join(',');
}

/** Возвращает подписи справочника для сохранённого значения fRoleInCase. */
export function formatFRoleInCaseLabels(value: string | null | undefined): string {
  const labels = parseFRoleInCaseKeys(value)
    .map(key => valueByKey.get(key))
    .filter((label): label is string => label !== undefined);

  return labels.join(', ');
}